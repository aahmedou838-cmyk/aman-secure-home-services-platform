import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
export const getUnreadNotifications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("notifications")
      .withIndex("by_toUserId_read", (q) => q.eq("toUserId", userId).eq("read", false))
      .order("desc")
      .collect();
  },
});
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.toUserId !== userId) return;
    await ctx.db.patch(args.notificationId, { read: true });
  },
});
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_toUserId_read", (q) => q.eq("toUserId", userId).eq("read", false))
      .collect();
    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }
  },
});
export const sendNotification = internalMutation({
  args: {
    toUserId: v.id("users"),
    fromJobId: v.optional(v.id("jobs")),
    type: v.union(v.literal("new_request"), v.literal("accepted"), v.literal("quote_received"), v.literal("system")),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      ...args,
      read: false,
      createdAt: Date.now(),
    });
  },
});