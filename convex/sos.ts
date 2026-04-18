import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
export const triggerSOS = mutation({
  args: {
    jobId: v.optional(v.id("jobs")),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const alertId = await ctx.db.insert("sos_alerts", {
      workerId: userId,
      jobId: args.jobId,
      location: { lat: args.lat, lng: args.lng },
      timestamp: Date.now(),
      resolved: false,
    });
    return alertId;
  },
});
export const getActiveAlerts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sos_alerts")
      .withIndex("by_resolved", (q) => q.eq("resolved", false))
      .collect();
  },
});
export const getAllAlerts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sos_alerts")
      .order("desc")
      .collect();
  },
});
export const resolveSOS = mutation({
  args: { alertId: v.id("sos_alerts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.alertId, {
      resolved: true,
    });
  },
});