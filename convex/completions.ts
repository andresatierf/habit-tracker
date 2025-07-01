import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get completions for a specific date range
export const getCompletions = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    habitIds: v.optional(v.array(v.id("habits"))),
    subHabitIds: v.optional(v.array(v.id("subHabits"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let completions = await ctx.db
      .query("completions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    // Filter by specific habits if provided
    if (args.habitIds && args.habitIds.length > 0) {
      completions = completions.filter(
        (c) => c.habitId && args.habitIds!.includes(c.habitId)
      );
    }

    // Filter by specific sub-habits if provided
    if (args.subHabitIds && args.subHabitIds.length > 0) {
      completions = completions.filter(
        (c) => c.subHabitId && args.subHabitIds!.includes(c.subHabitId)
      );
    }

    return completions;
  },
});

// Get completions for a specific date
export const getCompletionsForDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("completions")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", userId).eq("date", args.date)
      )
      .collect();
  },
});

// Toggle completion for a habit or sub-habit
export const toggleCompletion = mutation({
  args: {
    date: v.string(),
    habitId: v.optional(v.id("habits")),
    subHabitId: v.optional(v.id("subHabits")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!args.habitId && !args.subHabitId) {
      throw new Error("Either habitId or subHabitId must be provided");
    }

    // Find existing completion
    let existingCompletion;
    if (args.habitId) {
      existingCompletion = await ctx.db
        .query("completions")
        .withIndex("by_habit_and_date", (q) =>
          q.eq("habitId", args.habitId!).eq("date", args.date)
        )
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();
    } else if (args.subHabitId) {
      existingCompletion = await ctx.db
        .query("completions")
        .withIndex("by_subhabit_and_date", (q) =>
          q.eq("subHabitId", args.subHabitId!).eq("date", args.date)
        )
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();
    }

    if (existingCompletion) {
      // Toggle existing completion
      const patchData: Record<string, any> = {
        completed: !existingCompletion.completed,
      };
      if (args.metadata !== undefined) {
        patchData.metadata = args.metadata;
      }
      await ctx.db.patch(existingCompletion._id, patchData);
    } else {
      // Create new completion
      await ctx.db.insert("completions", {
        userId,
        habitId: args.habitId,
        subHabitId: args.subHabitId,
        date: args.date,
        completed: true,
        metadata: args.metadata,
      });
    }
  },
});

// Get completion statistics
export const getCompletionStats = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    habitId: v.optional(v.id("habits")),
    subHabitId: v.optional(v.id("subHabits")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { total: 0, completed: 0, percentage: 0 };

    let completions;
    if (args.habitId) {
      completions = await ctx.db
        .query("completions")
        .withIndex("by_habit_and_date", (q) => q.eq("habitId", args.habitId))
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), userId),
            q.gte(q.field("date"), args.startDate),
            q.lte(q.field("date"), args.endDate)
          )
        )
        .collect();
    } else if (args.subHabitId) {
      completions = await ctx.db
        .query("completions")
        .withIndex("by_subhabit_and_date", (q) =>
          q.eq("subHabitId", args.subHabitId)
        )
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), userId),
            q.gte(q.field("date"), args.startDate),
            q.lte(q.field("date"), args.endDate)
          )
        )
        .collect();
    } else {
      completions = await ctx.db
        .query("completions")
        .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
        .filter((q) =>
          q.and(
            q.gte(q.field("date"), args.startDate),
            q.lte(q.field("date"), args.endDate)
          )
        )
        .collect();
    }

    const completed = completions.filter((c) => c.completed).length;
    const total = completions.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  },
});
