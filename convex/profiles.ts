import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    // Identify if the user is anonymous (guest)
    // Anonymous users in Convex Auth usually lack an email/phone or specific providers
    const isAnonymous = !user.email && !user.phone;
    return {
      ...user,
      role: user.role ?? "client",
      isVerified: user.isVerified ?? false,
      specialties: user.specialties ?? [],
      isAnonymous,
    };
  },
});
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    await ctx.db.patch(userId, args);
  },
});
export const becomeProvider = mutation({
  args: {
    phone: v.string(),
    specialties: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    await ctx.db.patch(userId, {
      role: "provider",
      phone: args.phone,
      specialties: args.specialties,
      isVerified: false, // Pending review
    });
  },
});
export const toggleVerification = internalMutation({
  args: { userId: v.id("users"), verified: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { isVerified: args.verified });
  },
});