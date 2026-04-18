import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { PUZZLES_REGISTRY } from "../src/lib/gameConstants";
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
export const getPlayerInventory = query({
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
      .query("player_inventory")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .collect();
  },
});
export const getDailyRewardStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) return null;
    return await ctx.db
      .query("daily_rewards")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .unique();
  },
});
export const claimDailyReward = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new Error("Player not found");
    const now = Date.now();
    const existing = await ctx.db
      .query("daily_rewards")
      .withIndex("by_player", (q) => q.eq("playerId", player._id))
      .unique();
    if (existing) {
      const hoursSinceLast = (now - existing.lastClaimed) / (1000 * 60 * 60);
      if (hoursSinceLast < 24) {
        throw new Error(`يرجى الانتظار ${Math.ceil(24 - hoursSinceLast)} ساعة للمطالبة بالجائزة التالية`);
      }
      const newStreak = hoursSinceLast < 48 ? existing.streak + 1 : 1;
      await ctx.db.patch(existing._id, {
        lastClaimed: now,
        streak: newStreak,
      });
    } else {
      await ctx.db.insert("daily_rewards", {
        playerId: player._id,
        lastClaimed: now,
        streak: 1,
      });
    }
    const xpReward = 20;
    const newXp = player.xp + xpReward;
    const newLevel = Math.floor(newXp / 100) + 1;
    await ctx.db.patch(player._id, { xp: newXp, level: newLevel });
    return { xpGained: xpReward, leveledUp: newLevel > player.level };
  },
});
export const submitPuzzle = mutation({
  args: { puzzleId: v.string(), attempt: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new Error("Player not found");
    const puzzle = PUZZLES_REGISTRY[args.puzzleId];
    if (!puzzle) throw new Error("اللغز غير موجود");
    if (puzzle.solution === args.attempt) {
      // Reward XP
      const newXp = player.xp + puzzle.reward.xp;
      const newLevel = Math.floor(newXp / 100) + 1;
      await ctx.db.patch(player._id, { xp: newXp, level: newLevel });
      // Reward Item
      const existingItem = await ctx.db
        .query("player_inventory")
        .withIndex("by_player_item", (q) => q.eq("playerId", player._id).eq("itemKey", puzzle.reward.itemKey))
        .unique();
      if (existingItem) {
        await ctx.db.patch(existingItem._id, { quantity: existingItem.quantity + 1 });
      } else {
        await ctx.db.insert("player_inventory", {
          playerId: player._id,
          itemKey: puzzle.reward.itemKey,
          quantity: 1,
        });
      }
      // Update solve counter on user
      const user = await ctx.db.get(userId);
      await ctx.db.patch(userId, { puzzles_solved: (user?.puzzles_solved ?? 0) + 1 });
      return { success: true };
    }
    return { success: false };
  },
});
export const getSocialProfile = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) return null;
    const inventory = await ctx.db
      .query("player_inventory")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .take(3);
    return {
      nickname: player.nickname,
      level: player.level,
      xp: player.xp,
      topItems: inventory.map(i => i.itemKey),
    };
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