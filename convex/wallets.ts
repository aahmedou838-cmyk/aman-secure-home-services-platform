import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
export const getWallet = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!wallet) {
      const walletId = await ctx.db.insert("wallets", {
        userId,
        balance: 0,
        currency: "SAR",
      });
      return await ctx.db.get(walletId);
    }
    return wallet;
  },
});
export const topUp = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!wallet) {
      await ctx.db.insert("wallets", {
        userId,
        balance: args.amount,
        currency: "SAR",
      });
    } else {
      await ctx.db.patch(wallet._id, {
        balance: wallet.balance + args.amount,
      });
    }
  },
});
export const deductFunds = internalMutation({
  args: { userId: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!wallet || wallet.balance < args.amount) {
      throw new Error("Insufficient funds");
    }
    await ctx.db.patch(wallet._id, {
      balance: wallet.balance - args.amount,
    });
  },
});