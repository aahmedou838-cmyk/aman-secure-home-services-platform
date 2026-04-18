import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
export const createJob = mutation({
  args: {
    serviceType: v.string(),
    inspectionFee: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const jobId = await ctx.db.insert("jobs", {
      clientId: userId,
      status: "pending_inspection",
      serviceType: args.serviceType,
      inspectionFee: args.inspectionFee,
      createdAt: Date.now(),
    });
    return jobId;
  },
});
export const updateLocation = mutation({
  args: {
    jobId: v.id("jobs"),
    lat: v.number(),
    lng: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.jobId, {
      workerLocation: {
        lat: args.lat,
        lng: args.lng,
        lastUpdated: Date.now(),
      },
    });
  },
});
export const submitQuote = mutation({
  args: {
    jobId: v.id("jobs"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      quoteAmount: args.amount,
      status: "quote_pending",
    });
  },
});
export const approveQuote = mutation({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: "approved",
    });
  },
});
export const listActiveJobs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("jobs")
      .filter((q) => q.neq(q.field("status"), "completed"))
      .order("desc")
      .collect();
  },
});