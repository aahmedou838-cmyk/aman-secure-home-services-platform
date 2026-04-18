import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
export const createListing = mutation({
  args: {
    category: v.union(v.literal("freelance"), v.literal("transport"), v.literal("marketplace")),
    subcategory: v.string(),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    images: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (user.role !== "provider") {
      await ctx.db.patch(userId, { role: "provider" });
    }
    return await ctx.db.insert("providers_listings", {
      providerId: userId,
      ...args,
      active: true,
      createdAt: Date.now(),
    });
  },
});
export const updateListing = mutation({
  args: {
    id: v.id("providers_listings"),
    active: v.optional(v.boolean()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    const listing = await ctx.db.get(args.id);
    if (!listing || listing.providerId !== userId) throw new Error("Forbidden");
    const { id, ...patch } = args;
    await ctx.db.patch(id, patch);
  },
});
export const getMyListings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("providers_listings")
      .withIndex("by_providerId_active", (q) => q.eq("providerId", userId).eq("active", true))
      .order("desc")
      .take(50);
  },
});
export const getListingsByCategory = query({
  args: { category: v.union(v.literal("freelance"), v.literal("transport"), v.literal("marketplace")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("providers_listings")
      .withIndex("by_category_active", (q) => q.eq("category", args.category).eq("active", true))
      .order("desc")
      .take(50);
  },
});