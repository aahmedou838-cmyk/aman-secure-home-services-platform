import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
export const createJob = mutation({
  args: {
    serviceType: v.string(),
    inspectionFee: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    // Enforce upfront payment for inspection
    await ctx.runMutation(internal.wallets.deductFunds, {
      userId,
      amount: args.inspectionFee,
      type: "payment",
      description: `رسوم معاينة لخدمة: ${args.serviceType}`,
    });
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
export const acceptJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const job = await ctx.db.get(args.jobId);
    if (!job || job.status !== "pending_inspection") {
      throw new Error("Job is no longer available");
    }
    await ctx.db.patch(args.jobId, {
      workerId: userId,
      status: "en_route",
    });
  },
});
export const updateJobStatus = mutation({
  args: {
    jobId: v.id("jobs"),
    status: v.union(
      v.literal("arrived"),
      v.literal("inspection_complete"),
      v.literal("in_progress"),
      v.literal("completed")
    )
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const job = await ctx.db.get(args.jobId);
    if (!job || job.workerId !== userId) {
      throw new Error("Not assigned to this job");
    }
    await ctx.db.patch(args.jobId, { status: args.status });
  },
});
export const approveQuote = mutation({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const job = await ctx.db.get(args.jobId);
    if (!job || job.clientId !== userId || !job.quoteAmount) {
      throw new Error("Invalid job or missing quote");
    }
    // Deduct final quote amount
    await ctx.runMutation(internal.wallets.deductFunds, {
      userId,
      amount: job.quoteAmount,
      type: "payment",
      description: `دفع قيمة العمل لخدمة: ${job.serviceType}`,
    });
    await ctx.db.patch(args.jobId, {
      status: "approved",
      isPaid: true,
    });
  },
});
export const cancelJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    const isWorker = job.workerId === userId;
    const update: any = { status: "cancelled" };
    if (isWorker && job.status !== "pending_inspection") {
      update.penaltyTier = (job.penaltyTier ?? 0) + 1;
      // Deduct penalty from worker
      await ctx.runMutation(internal.wallets.deductFunds, {
        userId,
        amount: 25, // Fixed penalty amount for cancellation
        type: "penalty",
        description: "غرامة إلغاء مهمة بعد القبول",
      });
    }
    await ctx.db.patch(args.jobId, update);
  },
});
export const listActiveJobs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("jobs")
      .withIndex("by_client", (q) => q.eq("clientId", userId))
      .filter((q) => q.neq(q.field("status"), "completed"))
      .order("desc")
      .collect();
  },
});
export const listAvailableJobs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "pending_inspection"))
      .order("desc")
      .collect();
  },
});
export const listWorkerJobs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("jobs")
      .withIndex("by_worker", (q) => q.eq("workerId", userId))
      .filter((q) => q.neq(q.field("status"), "completed"))
      .order("desc")
      .collect();
  },
});
export const submitQuote = mutation({
  args: { jobId: v.id("jobs"), amount: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.jobId, {
      quoteAmount: args.amount,
      status: "quote_pending",
    });
  },
});