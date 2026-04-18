import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});
export const initializePlayer = mutation({
  args: {
    nickname: v.string(),
    avatarIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const existing = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) return existing._id;
    const playerId = await ctx.db.insert("players", {
      userId,
      nickname: args.nickname,
      avatarIndex: args.avatarIndex,
      level: 1,
      xp: 0,
      position: { x: 500, y: 500 },
      zoneId: "starter_zone",
      lastActive: Date.now(),
    });
    await ctx.db.patch(userId, { role: "player" });
    return playerId;
  },
});
export const updatePosition = mutation({
  args: {
    x: v.number(),
    y: v.number(),
    zoneId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const player = await ctx.db
      .query("players")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!player) throw new Error("Player not found");
    // Basic anti-teleport check
    const dx = Math.abs(player.position.x - args.x);
    const dy = Math.abs(player.position.y - args.y);
    if (dx > 200 || dy > 200) {
      // Log suspicious activity but allow for now for network jitter
      console.warn("Large movement detected", { userId, dx, dy });
    }
    await ctx.db.patch(player._id, {
      position: { x: args.x, y: args.y },
      zoneId: args.zoneId,
      lastActive: Date.now(),
    });
  },
});
export const getActivePlayers = query({
  args: { zoneId: v.string() },
  handler: async (ctx, args) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return await ctx.db
      .query("players")
      .withIndex("by_zone_active", (q) => 
        q.eq("zoneId", args.zoneId).gt("lastActive", fiveMinutesAgo)
      )
      .take(50);
  },
});