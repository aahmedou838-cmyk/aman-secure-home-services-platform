import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
const applicationTables = {
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    role: v.optional(v.union(v.literal("client"), v.literal("provider"), v.literal("player"))),
    phone: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())),
    isVerified: v.optional(v.boolean()),
    puzzles_solved: v.optional(v.number()),
  })
  .index("by_email", ["email"])
  .index("by_role", ["role"]),
  players: defineTable({
    userId: v.id("users"),
    nickname: v.string(),
    avatarIndex: v.number(),
    level: v.number(),
    xp: v.number(),
    position: v.object({
      x: v.number(),
      y: v.number(),
    }),
    lastActive: v.number(),
    zoneId: v.string(),
  })
  .index("by_userId", ["userId"])
  .index("by_zone_active", ["zoneId", "lastActive"]),
  player_inventory: defineTable({
    playerId: v.id("players"),
    itemKey: v.string(),
    quantity: v.number(),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
  .index("by_player", ["playerId"])
  .index("by_player_item", ["playerId", "itemKey"]),
  daily_rewards: defineTable({
    playerId: v.id("players"),
    lastClaimed: v.number(),
    streak: v.number(),
  })
  .index("by_player", ["playerId"]),
  world_regions: defineTable({
    regionId: v.string(),
    requiredLevel: v.number(),
    name: v.string(),
  })
  .index("by_regionId", ["regionId"]),
  game_quests: defineTable({
    questId: v.string(),
    title: v.string(),
    description: v.string(),
    rewardXp: v.number(),
    type: v.union(v.literal("fetch"), v.literal("puzzle"), v.literal("dialogue")),
    prerequisiteQuestId: v.optional(v.string()),
  }).index("by_questId", ["questId"]),
  player_quests: defineTable({
    playerId: v.id("players"),
    questId: v.string(),
    status: v.union(v.literal("available"), v.literal("active"), v.literal("completed")),
    progress: v.number(),
    updatedAt: v.number(),
  })
  .index("by_player", ["playerId"])
  .index("by_player_quest", ["playerId", "questId"]),
  notifications: defineTable({
    toUserId: v.id("users"),
    fromJobId: v.optional(v.id("jobs")),
    type: v.union(v.literal("new_request"), v.literal("accepted"), v.literal("quote_received"), v.literal("system")),
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  })
  .index("by_toUserId_read", ["toUserId", "read"])
  .index("by_toUserId", ["toUserId"]),
  wallets: defineTable({
    userId: v.id("users"),
    balance: v.number(),
    currency: v.optional(v.string()),
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
    category: v.optional(v.union(v.literal("freelance"), v.literal("transport"), v.literal("marketplace"))),
    publicFeed: v.optional(v.boolean()),
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
    .index("by_status", ["status"])
    .index("by_public_status", ["publicFeed", "status"]),
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
  providers_listings: defineTable({
    providerId: v.id("users"),
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
    active: v.boolean(),
    createdAt: v.number(),
  })
  .index("by_providerId", ["providerId"])
  .index("by_category_active", ["category", "active"])
  .index("by_subcategory_active", ["subcategory", "active"])
  .index("by_providerId_active", ["providerId", "active"]),
};
export default defineSchema({
  ...authTables,
  ...applicationTables,
});