import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
export const getWallet = query({
  args: {},
  returns: v.union(v.object({ _id: v.id("wallets"), userId: v.id("users"), balance: v.number(), currency: v.string() }), v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return (await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("asc")
      .take(1))[0] || null;
  },
});
export const ensureWallet = mutation({
  args: {},
  returns: v.id("wallets"),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const existing = (await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("asc")
      .take(1))[0];
    if (existing) return existing._id;
    return await ctx.db.insert("wallets", {
      userId,
      balance: 0,
      currency: "MRU",
    });
  },
});
export const getTransactions = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("wallet_transactions"),
    walletId: v.id("wallets"),
    userId: v.id("users"),
    type: v.union(v.literal("deposit"), v.literal("payment"), v.literal("payout"), v.literal("penalty"), v.literal("commission")),
    amount: v.number(),
    description: v.string(),
    timestamp: v.number()
  })),
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
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    let wallet = (await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("asc")
      .take(1))[0];
    if (!wallet) {
      const walletId = await ctx.db.insert("wallets", {
        userId,
        balance: args.amount,
        currency: "MRU",
      });
      const newWallet = await ctx.db.get(walletId);
      if (!newWallet) throw new Error("Failed to retrieve newly created wallet");
      wallet = newWallet;
    } else {
      await ctx.db.patch(wallet._id, {
        balance: wallet.balance + args.amount,
      });
    }
    if (wallet && (!wallet.currency || wallet.currency !== 'MRU')) {
      await ctx.db.patch(wallet._id, { currency: 'MRU' });
    }
    if (wallet) {
      await ctx.db.insert("wallet_transactions", {
        walletId: wallet._id,
        userId: userId,
        type: "deposit",
        amount: args.amount,
        description: "شحن رصيد المحفظة (أوقية)",
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
  returns: v.null(),
  handler: async (ctx, args) => {
    let wallet = (await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("asc")
      .take(1))[0];
    if (!wallet) {
      const walletId = await ctx.db.insert("wallets", {
        userId: args.userId,
        balance: args.amount,
        currency: "MRU",
      });
      const newWallet = await ctx.db.get(walletId);
      if (!newWallet) throw new Error("Failed to retrieve newly created wallet");
      wallet = newWallet;
    } else {
      await ctx.db.patch(wallet._id, {
        balance: wallet.balance + args.amount,
      });
    }
    if (wallet && (!wallet.currency || wallet.currency !== 'MRU')) {
      await ctx.db.patch(wallet._id, { currency: 'MRU' });
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
  returns: v.null(),
  handler: async (ctx, args) => {
    const wallet = (await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("asc")
      .take(1))[0];
    if (wallet && (!wallet.currency || wallet.currency !== 'MRU')) {
      await ctx.db.patch(wallet._id, { currency: 'MRU' });
    }
    if (!wallet || wallet.balance < args.amount) {
      throw new Error("رصيد غير كافٍ بالأوقية");
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
  returns: v.null(),
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
      description: `دفعة مستحقة (أوقية) للمهمة رقم: ${args.jobId.slice(-6)}`,
    });
    const wallet = (await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.workerId))
      .order("asc")
      .take(1))[0];
    if (wallet) {
      await ctx.db.insert("wallet_transactions", {
        walletId: wallet._id,
        userId: args.workerId,
        type: "commission",
        amount: commission,
        description: "عمولة المنصة 15% (أوقية)",
        timestamp: Date.now(),
      });
      await ctx.db.insert("wallet_transactions", {
        walletId: wallet._id,
        userId: args.workerId,
        type: "commission",
        amount: insurance,
        description: "صندوق تأمين الفنيين 2% (أوقية)",
        timestamp: Date.now(),
      });
    }
  },
});