import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
export const listActiveQuests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) return [];
    return await ctx.db
      .query("player_quests")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});
export const getQuestDefinition = query({
  args: { questId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("game_quests")
      .withIndex("by_questId", (q) => q.eq("questId", args.questId))
      .unique();
  },
});
export const acceptQuest = mutation({
  args: { questId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new Error("Player not found");
    const existing = await ctx.db
      .query("player_quests")
      .withIndex("by_player_quest", (q) => q.eq("playerId", player._id).eq("questId", args.questId))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("player_quests", {
      playerId: player._id,
      questId: args.questId,
      status: "active",
      progress: 0,
      updatedAt: Date.now(),
    });
  },
});
export const completeQuest = mutation({
  args: { questId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new Error("Player not found");
    const playerQuest = await ctx.db
      .query("player_quests")
      .withIndex("by_player_quest", (q) => q.eq("playerId", player._id).eq("questId", args.questId))
      .unique();
    if (!playerQuest || playerQuest.status === "completed") return;
    const questDef = await ctx.db
      .query("game_quests")
      .withIndex("by_questId", (q) => q.eq("questId", args.questId))
      .unique();
    if (!questDef) throw new Error("Quest definition missing");
    await ctx.db.patch(playerQuest._id, {
      status: "completed",
      updatedAt: Date.now(),
    });
    const newXp = player.xp + questDef.rewardXp;
    const newLevel = Math.floor(newXp / 100) + 1;
    await ctx.db.patch(player._id, {
      xp: newXp,
      level: newLevel,
    });
    return { xpGained: questDef.rewardXp, leveledUp: newLevel > player.level };
  },
});