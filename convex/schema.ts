import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  habits: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.string(),
    icon: v.string(),
    isActive: v.boolean(),
    parentId: v.optional(v.id("habits")),
    metadata: v.optional(v.array(v.object({
      name: v.string(),
      type: v.union(v.literal("text"), v.literal("number"), v.literal("boolean"), v.literal("date"), v.literal("enum")),
      options: v.optional(v.array(v.string())),
    }))),
  }).index("by_user", ["userId"])
    .index("by_parent", ["parentId"]),

  completions: defineTable({
    userId: v.id("users"),
    habitId: v.id("habits"),
    date: v.string(), // YYYY-MM-DD format
    completed: v.boolean(),
    metadata: v.optional(v.any()),
  }).index("by_user_and_date", ["userId", "date"])
   .index("by_habit_and_date", ["habitId", "date"])
   .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
