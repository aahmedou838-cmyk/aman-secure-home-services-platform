import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
const applicationTables = {
  users: defineTable({
    // Auth fields (required for @convex-dev/auth integration)
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    // Custom Marketplace fields
    role: v.union(v.literal("client"), v.literal("provider")),
    phone: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())),
    isVerified: v.optional(v.boolean()),
  })
  .index("by_email", ["email"])
  .index("by_role", ["role"]),
  wallets: defineTable({
    userId: v.id("users"),
    balance: v.number(),
    currency: v.string(),
  }).index("by_userId", ["userId"]),
  wallet_transactions: defineTable({
    walletId: v.id("wallets"),
    userId: v.id("users"),
    type: v.union(
      v.literal("deposit"),
      v.literal("payment"),
      v.literal("payout"),
      v.literal("penalty"),
      v.literal("commission")
    ),
    amount: v.number(),
    description: v.string(),
    timestamp: v.number(),
  }).index("by_walletId", ["walletId"])
    .index("by_userId", ["userId"]),
  files: defineTable({
    userId: v.id("users"),
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    description: v.optional(v.string()),
    uploadedAt: v.number(),
  })
    .index("by_userId_uploadedAt", ["userId", "uploadedAt"])
    .index("by_userId_storageId", ["userId", "storageId"]),
  jobs: defineTable({
    clientId: v.id("users"),
    workerId: v.optional(v.id("users")),
    status: v.union(
      v.literal("pending_inspection"),
      v.literal("en_route"),
      v.literal("arrived"),
      v.literal("inspection_complete"),
      v.literal("quote_pending"),
      v.literal("approved"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    serviceType: v.string(),
    providerSpecialtiesRequired: v.array(v.string()),
    inspectionFee: v.number(),
    quoteAmount: v.optional(v.number()),
    workerLocation: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
        lastUpdated: v.number(),
      })
    ),
    penaltyTier: v.optional(v.number()),
    isPaid: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_worker", ["workerId"])
    .index("by_status", ["status"]),
  sos_alerts: defineTable({
    workerId: v.id("users"),
    jobId: v.optional(v.id("jobs")),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    timestamp: v.number(),
    resolved: v.boolean(),
  })
    .index("by_worker", ["workerId"])
    .index("by_resolved", ["resolved"]),
};
export default defineSchema({
  ...authTables,
  ...applicationTables,
});