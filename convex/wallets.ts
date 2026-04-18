import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
export const getWallet = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});
export const ensureWallet = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const existing = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("wallets", {
      userId,
      balance: 0,
      currency: "SAR",
    });
  },
});
export const getTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("wallet_transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(15);
  },
});
export const topUp = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    let wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!wallet) {
      const walletId = await ctx.db.insert("wallets", {
        userId,
        balance: args.amount,
        currency: "SAR",
      });
      wallet = await ctx.db.get(walletId);
    } else {
      await ctx.db.patch(wallet._id, {
        balance: wallet.balance + args.amount,
      });
    }
    if (wallet) {
      await ctx.db.insert("wallet_transactions", {
        walletId: wallet._id,
        userId: userId,
        type: "deposit",
        amount: args.amount,
        description: "شحن رصيد المحفظة",
        timestamp: Date.now(),
      });
    }
  },
});
export const creditFunds = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    description: v.string(),
    type: v.union(v.literal("deposit"), v.literal("payout"))
  },
  handler: async (ctx, args) => {
    let wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!wallet) {
      const walletId = await ctx.db.insert("wallets", {
        userId: args.userId,
        balance: args.amount,
        currency: "SAR",
      });
      wallet = await ctx.db.get(walletId);
    } else {
      await ctx.db.patch(wallet._id, {
        balance: wallet.balance + args.amount,
      });
    }
    if (wallet) {
      await ctx.db.insert("wallet_transactions", {
        walletId: wallet._id,
        userId: args.userId,
        type: args.type,
        amount: args.amount,
        description: args.description,
        timestamp: Date.now(),
      });
    }
  },
});
export const deductFunds = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    description: v.string(),
    type: v.union(v.literal("payment"), v.literal("penalty"), v.literal("commission"))
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!wallet || wallet.balance < args.amount) {
      throw new Error("رصيد غير كافٍ");
    }
    await ctx.db.patch(wallet._id, {
      balance: wallet.balance - args.amount,
    });
    await ctx.db.insert("wallet_transactions", {
      walletId: wallet._id,
      userId: args.userId,
      type: args.type,
      amount: args.amount,
      description: args.description,
      timestamp: Date.now(),
    });
  },
});
export const processPayout = internalMutation({
  args: {
    jobId: v.id("jobs"),
    workerId: v.id("users"),
    amount: v.number()
  },
  handler: async (ctx, args) => {
    const COMMISSION_RATE = 0.15;
    const INSURANCE_RATE = 0.02;
    const commission = args.amount * COMMISSION_RATE;
    const insurance = args.amount * INSURANCE_RATE;
    const netPayout = args.amount - commission - insurance;
    await ctx.runMutation(internal.wallets.creditFunds, {
      userId: args.workerId,
      amount: netPayout,
      type: "payout",
      description: `دفعة مستحقة للمهمة رقم: ${args.jobId.slice(-6)}`,
    });
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.workerId))
      .unique();
    if (wallet) {
      await ctx.db.insert("wallet_transactions", {
        walletId: wallet._id,
        userId: args.workerId,
        type: "commission",
        amount: commission,
        description: "عمولة المنصة (15%)",
        timestamp: Date.now(),
      });
      await ctx.db.insert("wallet_transactions", {
        walletId: wallet._id,
        userId: args.workerId,
        type: "commission",
        amount: insurance,
        description: "صندوق تأمين الفنيين (2%)",
        timestamp: Date.now(),
      });
    }
  },
});