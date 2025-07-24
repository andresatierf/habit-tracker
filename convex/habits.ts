import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

// Get all habits for the current user
export const getHabits = query({
  args: { includeSubHabits: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let habitsQuery = ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true));

    if (!args.includeSubHabits) {
      habitsQuery = habitsQuery.filter((q) =>
        q.eq(q.field("parentId"), undefined),
      );
    }

    const habits = await habitsQuery.collect();

    return habits;
  },
});

export const getSubHabits = query({
  args: { parentId: v.id("habits") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const subHabits = await ctx.db
      .query("habits")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
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
    parentId: v.optional(v.id("habits")),
    metadata: v.optional(
      v.array(
        v.object({
          name: v.string(),
          type: v.union(
            v.literal("text"),
            v.literal("number"),
            v.literal("boolean"),
            v.literal("date"),
            v.literal("enum"),
          ),
          options: v.optional(v.array(v.string())),
        }),
      ),
    ),
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
      parentId: args.parentId,
      metadata: args.metadata,
    });
  },
});

// Get habit
export const getHabit = query({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const habit = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("_id"), args.habitId))
      .first();

    return habit;
  },
});

export const getHabitsByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const date = args.date.split("T")[0]; // YYYY-MM-DD

    const habitsWithCompletion = await Promise.all(
      habits.map(async (habit) => {
        const completion = await ctx.db
          .query("completions")
          .withIndex("by_habit_and_date", (q) =>
            q.eq("habitId", habit._id).eq("date", date),
          )
          .first();
        return {
          ...habit,
          completed: completion?.completed ?? false,
        };
      }),
    );

    return habitsWithCompletion;
  },
});

// Update a habit
export const updateHabit = mutation({
  args: {
    habitId: v.id("habits"),
    name: v.string(),
    color: v.string(),
    icon: v.string(),
    parentId: v.optional(v.id("habits")),
    metadata: v.optional(
      v.array(
        v.object({
          name: v.string(),
          type: v.union(
            v.literal("text"),
            v.literal("number"),
            v.literal("boolean"),
            v.literal("date"),
            v.literal("enum"),
          ),
          options: v.optional(v.array(v.string())),
        }),
      ),
    ),
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
      parentId: args.parentId,
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

    // Also deactivate all children (sub-habits)
    const subHabits = await ctx.db
      .query("habits")
      .withIndex("by_parent", (q) => q.eq("parentId", args.habitId))
      .collect();

    for (const subHabit of subHabits) {
      await ctx.db.patch(subHabit._id, { isActive: false });
    }
  },
});
