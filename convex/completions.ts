import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get completions for a specific date range
export const getCompletions = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    habitIds: v.optional(v.array(v.id("habits"))),
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
    habitId: v.id("habits"),
    completed: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Find existing completion
    const existingCompletion = await ctx.db
      .query("completions")
      .withIndex("by_habit_and_date", (q) =>
        q.eq("habitId", args.habitId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existingCompletion) {
      // Toggle existing completion
      const patchData: Record<string, any> = {
        completed:
          args.completed !== undefined
            ? args.completed
            : !existingCompletion.completed,
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
        date: args.date,
        completed: args.completed !== undefined ? args.completed : true,
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { total: 0, completed: 0, percentage: 0 };

    let completions;
    if (args.habitId) {
      completions = await ctx.db
        .query("completions")
        .withIndex("by_habit_and_date", (q) => q.eq("habitId", args.habitId!))
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
