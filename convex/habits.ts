import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all habits for the current user
export const getHabits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return habits;
  },
});

// Get sub-habits for a specific habit
export const getSubHabits = query({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const subHabits = await ctx.db
      .query("subHabits")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return subHabits;
  },
});

// Get all sub-habits for the current user
export const getAllSubHabits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const subHabits = await ctx.db
      .query("subHabits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return subHabits;
  },
});

// Create a new habit
export const createHabit = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    icon: v.string(),
    metadata: v.optional(v.array(v.object({
      name: v.string(),
      type: v.union(v.literal("text"), v.literal("number"), v.literal("boolean"), v.literal("date"), v.literal("enum")),
      options: v.optional(v.array(v.string())),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("habits", {
      userId,
      name: args.name,
      color: args.color,
      icon: args.icon,
      isActive: true,
      metadata: args.metadata,
    });
  },
});

// Create a new sub-habit
export const createSubHabit = mutation({
  args: {
    habitId: v.id("habits"),
    name: v.string(),
    color: v.string(),
    icon: v.string(),
    metadata: v.optional(v.array(v.object({
      name: v.string(),
      type: v.union(v.literal("text"), v.literal("number"), v.literal("boolean"), v.literal("date"), v.literal("enum")),
      options: v.optional(v.array(v.string())),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("subHabits", {
      habitId: args.habitId,
      userId,
      name: args.name,
      color: args.color,
      icon: args.icon,
      isActive: true,
      metadata: args.metadata,
    });
  },
});

// Update a habit
export const updateHabit = mutation({
  args: {
    habitId: v.id("habits"),
    name: v.string(),
    color: v.string(),
    icon: v.string(),
    metadata: v.optional(v.array(v.object({
      name: v.string(),
      type: v.union(v.literal("text"), v.literal("number"), v.literal("boolean"), v.literal("date"), v.literal("enum")),
      options: v.optional(v.array(v.string())),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== userId) {
      throw new Error("Habit not found or unauthorized");
    }

    await ctx.db.patch(args.habitId, {
      name: args.name,
      color: args.color,
      icon: args.icon,
      metadata: args.metadata,
    });
  },
});

// Update a sub-habit
export const updateSubHabit = mutation({
  args: {
    subHabitId: v.id("subHabits"),
    name: v.string(),
    color: v.string(),
    icon: v.string(),
    metadata: v.optional(v.array(v.object({
      name: v.string(),
      type: v.union(v.literal("text"), v.literal("number"), v.literal("boolean"), v.literal("date"), v.literal("enum")),
      options: v.optional(v.array(v.string())),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const subHabit = await ctx.db.get(args.subHabitId);
    if (!subHabit || subHabit.userId !== userId) {
      throw new Error("Sub-habit not found or unauthorized");
    }

    await ctx.db.patch(args.subHabitId, {
      name: args.name,
      color: args.color,
      icon: args.icon,
      metadata: args.metadata,
    });
  },
});

// Delete a habit (soft delete)
export const deleteHabit = mutation({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== userId) {
      throw new Error("Habit not found or unauthorized");
    }

    await ctx.db.patch(args.habitId, { isActive: false });

    // Also deactivate all sub-habits
    const subHabits = await ctx.db
      .query("subHabits")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .collect();

    for (const subHabit of subHabits) {
      await ctx.db.patch(subHabit._id, { isActive: false });
    }
  },
});

// Delete a sub-habit (soft delete)
export const deleteSubHabit = mutation({
  args: { subHabitId: v.id("subHabits") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const subHabit = await ctx.db.get(args.subHabitId);
    if (!subHabit || subHabit.userId !== userId) {
      throw new Error("Sub-habit not found or unauthorized");
    }

    await ctx.db.patch(args.subHabitId, { isActive: false });
  },
});
