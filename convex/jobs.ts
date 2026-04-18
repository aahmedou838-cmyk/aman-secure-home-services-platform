import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
export const createJob = mutation({
  args: {
    serviceType: v.string(),
    category: v.union(v.literal("freelance"), v.literal("transport"), v.literal("marketplace")),
    specialtiesRequired: v.array(v.string()),
    inspectionFee: v.number(),
    publicFeed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    if (args.inspectionFee > 0) {
      await ctx.runMutation(internal.wallets.deductFunds, {
        userId,
        amount: args.inspectionFee,
        type: "payment",
        description: `رسوم معاينة لخدمة: ${args.serviceType}`,
      });
    }
    const jobId = await ctx.db.insert("jobs", {
      clientId: userId,
      status: "pending_inspection",
      serviceType: args.serviceType,
      category: args.category,
      publicFeed: args.publicFeed ?? true,
      providerSpecialtiesRequired: args.specialtiesRequired,
      inspectionFee: args.inspectionFee,
      createdAt: Date.now(),
    });
    // Notify matching providers
    const matchingProviders = await ctx.db
      .query("providers_listings")
      .withIndex("by_subcategory_active", (q) => q.eq("subcategory", args.serviceType).eq("active", true))
      .collect();
    const uniqueProviderIds = Array.from(new Set(matchingProviders.map(p => p.providerId)));
    for (const providerId of uniqueProviderIds) {
      if (providerId !== userId) {
        await ctx.runMutation(internal.notifications.sendNotification, {
          toUserId: providerId,
          fromJobId: jobId,
          type: "new_request",
          title: "طلب خدمة جديد",
          body: `يوجد طلب جديد لخدمة ${args.serviceType} في منطقتك.`,
        });
      }
    }
    return jobId;
  },
});
export const listOpenRequests = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_public_status", (q) => q.eq("publicFeed", true).eq("status", "pending_inspection"))
      .order("desc")
      .take(20);
  },
});
export const acceptJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const job = await ctx.db.get(args.jobId);
    if (!job || job.status !== "pending_inspection") {
      throw new Error("الطلب لم يعد متاحاً");
    }
    await ctx.db.patch(args.jobId, {
      workerId: userId,
      status: "en_route",
      workerLocation: { lat: 18.0735, lng: -15.9582, lastUpdated: Date.now() }
    });
    await ctx.runMutation(internal.notifications.sendNotification, {
      toUserId: job.clientId,
      fromJobId: args.jobId,
      type: "accepted",
      title: "تم قبول طلبك",
      body: "قام أحد الفنيين بقبول طلبك وهو الآن في الطريق إليك.",
    });
  },
});
export const listAvailableJobs = query({
  args: { providerSpecialties: v.optional(v.array(v.string())) },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "pending_inspection"))
      .order("desc")
      .collect();
    if (!args.providerSpecialties || args.providerSpecialties.length === 0) return jobs;
    return jobs.filter(j => j.providerSpecialtiesRequired.some(s => args.providerSpecialties?.includes(s)));
  },
});
export const updateWorkerLocation = mutation({
  args: { jobId: v.id("jobs"), lat: v.number(), lng: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job || job.workerId !== userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.jobId, {
      workerLocation: { lat: args.lat, lng: args.lng, lastUpdated: Date.now() }
    });
  },
});
export const updateJobStatus = mutation({
  args: { jobId: v.id("jobs"), status: v.union(v.literal("arrived"), v.literal("inspection_complete"), v.literal("in_progress"), v.literal("completed")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job || job.workerId !== userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.jobId, { status: args.status });
  },
});
export const submitQuote = mutation({
  args: { jobId: v.id("jobs"), amount: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job || job.workerId !== userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.jobId, { quoteAmount: args.amount, status: "quote_pending" });
    await ctx.runMutation(internal.notifications.sendNotification, {
      toUserId: job.clientId,
      fromJobId: args.jobId,
      type: "quote_received",
      title: "عرض سعر جديد",
      body: `لقد قدم الفني عرض سعر بقيمة ${args.amount} أ.م لمهمتك.`,
    });
  },
});
export const approveQuote = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job || job.clientId !== userId || !job.quoteAmount) throw new Error("Invalid job");
    await ctx.runMutation(internal.wallets.deductFunds, {
      userId,
      amount: job.quoteAmount,
      type: "payment",
      description: `دفع قيمة العمل لخدمة: ${job.serviceType}`,
    });
    await ctx.db.patch(args.jobId, { status: "approved", isPaid: true });
  },
});
export const completeJob = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job || job.workerId !== userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.jobId, { status: "completed" });
    if (job.quoteAmount) {
      await ctx.runMutation(internal.wallets.processPayout, {
        jobId: args.jobId,
        workerId: userId,
        amount: job.quoteAmount,
      });
    }
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
export const listHistoryJobs = query({
  args: { role: v.union(v.literal("client"), v.literal("worker")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const index = args.role === "client" ? "by_client" : "by_worker";
    const field = args.role === "client" ? "clientId" : "workerId";
    return await ctx.db
      .query("jobs")
      .withIndex(index, (q) => q.eq(field as any, userId))
      .filter((q) => q.eq(q.field("status"), "completed"))
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
export const applyPenalty = mutation({
  args: { jobId: v.id("jobs"), tier: v.number(), reason: v.string() },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || !job.workerId) throw new Error("Not found");
    const penalty = args.tier * 200;
    await ctx.runMutation(internal.wallets.deductFunds, {
      userId: job.workerId,
      amount: penalty,
      type: "penalty",
      description: `مخالفة: ${args.reason}`,
    });
    await ctx.db.patch(args.jobId, { penaltyTier: args.tier });
  },
});