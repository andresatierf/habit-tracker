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
  }).index("by_user", ["userId"]),

  subHabits: defineTable({
    habitId: v.id("habits"),
    userId: v.id("users"),
    name: v.string(),
    color: v.string(),
    icon: v.string(),
    isActive: v.boolean(),
  }).index("by_habit", ["habitId"])
   .index("by_user", ["userId"]),

  completions: defineTable({
    userId: v.id("users"),
    habitId: v.optional(v.id("habits")),
    subHabitId: v.optional(v.id("subHabits")),
    date: v.string(), // YYYY-MM-DD format
    completed: v.boolean(),
  }).index("by_user_and_date", ["userId", "date"])
   .index("by_habit_and_date", ["habitId", "date"])
   .index("by_subhabit_and_date", ["subHabitId", "date"])
   .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
