import { useCallback, useMemo, useState } from "react";

import { Temporal } from "@js-temporal/polyfill";
import { useQuery } from "convex/react";
import tinycolor from "tinycolor2";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { cn, generateDateRange } from "@/lib/utils";

import { api } from "../../../convex/_generated/api";

export function HeatmapCalendar() {
  const selectedHabits = useStore((state) => state.filters.habits);
  const [selectedYear, setSelectedYear] = useState(
    Temporal.Now.plainDateISO().year,
  );

  const allHabits =
    useQuery(api.habits.getHabits, { includeSubHabits: true }) || [];

  // Generate date range for the entire year
  const dateRange = useMemo(() => {
    return generateDateRange({
      first: Temporal.PlainDate.from({ year: selectedYear, month: 1, day: 1 }),
      last: Temporal.PlainDate.from({ year: selectedYear, month: 12, day: 31 }),
      withWeekPadding: true,
    });
  }, [selectedYear]);

  const completions =
    useQuery(api.completions.getCompletions, {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      habitIds: selectedHabits.length > 0 ? selectedHabits : undefined,
    }) || [];

  // Filter habits based on selection
  const displayHabits = useMemo(() => {
    return selectedHabits.length > 0
      ? allHabits.filter((h) => selectedHabits.includes(h._id))
      : allHabits;
  }, [selectedHabits, allHabits]);

  const getDayColor = useCallback(
    (date: string) => {
      const dateCompletions = completions.filter(
        (c) => c.date === date && c.completed,
      );

      if (dateCompletions.length === 0) {
        return "#ebedf0"; // No activity
      }

      const habitColors = dateCompletions
        .map((completion) => {
          const habit = displayHabits.find((h) => h._id === completion.habitId);
          return habit ? tinycolor(habit.color) : null;
        })
        .filter((color): color is tinycolor.Instance => color !== null);

      if (habitColors.length === 0) {
        return "#ebedf0";
      }

      if (habitColors.length === 1) {
        return habitColors[0].toHexString();
      }

      // Blend colors by averaging their RGB values
      let totalR = 0;
      let totalG = 0;
      let totalB = 0;

      habitColors.forEach((color) => {
        const rgb = color.toRgb();
        totalR += rgb.r;
        totalG += rgb.g;
        totalB += rgb.b;
      });

      const avgR = Math.round(totalR / habitColors.length);
      const avgG = Math.round(totalG / habitColors.length);
      const avgB = Math.round(totalB / habitColors.length);

      return tinycolor({ r: avgR, g: avgG, b: avgB }).toHexString();
    },
    [completions, displayHabits],
  );

  const getTooltipText = (date: string) => {
    const dateObj = new Date(date);
    const dateCompletions = completions.filter(
      (c) => c.date === date && c.completed,
    );
    const totalPossible = displayHabits.length;

    return `${dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })}\n${dateCompletions.length} of ${totalPossible} habits completed`;
  };

  // Group dates by weeks
  const weeks = useMemo(() => {
    const weekGroups = [];
    for (let i = 0; i < dateRange.dates.length; i += 7) {
      weekGroups.push(dateRange.dates.slice(i, i + 7));
    }
    return weekGroups;
  }, [dateRange.dates]);

  // Calculate stats
  const stats = useMemo(() => {
    const yearDates = dateRange.dates.filter(
      (date) => date.year === selectedYear,
    );
    const totalDays = yearDates.length;
    const activeDays = yearDates.filter((date) => {
      const dateString = date.toString();
      return getDayColor(dateString) !== "#ebedf0";
    }).length;

    const currentStreak = (() => {
      let streak = 0;
      let current = Temporal.Now.plainDateISO();

      while (Temporal.PlainDate.compare(current, yearDates[0]) > 0) {
        if (getDayColor(current.toString()) !== "#ebedf0") {
          streak++;
        } else {
          break;
        }
        current = current.subtract({ days: 1 });
      }

      return streak;
    })();

    return {
      totalDays,
      activeDays,
      currentStreak,
      completionRate:
        totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0,
    };
  }, [dateRange.dates, selectedYear, getDayColor]);

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 2; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  }, []);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Activity Heatmap
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {stats.activeDays} active days in {selectedYear} •{" "}
            {stats.completionRate}% completion rate
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Current streak:{" "}
            <span className="font-semibold text-green-600">
              {stats.currentStreak} days
            </span>
          </div>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="m-auto grid w-fit grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-2">
        {/* Month labels */}
        <div className="col-start-2 row-start-1 mb-2 flex justify-between text-xs text-gray-500">
          {[
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ].map((month, index) => (
            <div key={month} className="flex-1 text-center">
              {index % 2 === 0 ? month : ""}
            </div>
          ))}
        </div>

        {/* Day labels */}
        <div className="col-start-1 row-start-2 mr-2 flex flex-col gap-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
            (day, index) => (
              <div
                key={day}
                className="flex h-3 items-center text-xs text-gray-500"
              >
                {index % 2 === 1 ? day : ""}
              </div>
            ),
          )}
        </div>

        {/* Heatmap grid */}
        <div className="col-start-2 row-start-2 flex gap-1">
          {/* Calendar grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((date) => {
                  const dateString = date.toString();
                  const color = getDayColor(dateString);
                  const isCurrentYear = date.year === selectedYear;
                  const today = Temporal.Now.plainDateISO().toString();

                  return (
                    <div
                      key={dateString}
                      className={cn(
                        "size-3 rounded-sm border border-gray-200",
                        {
                          "border-blue-500": dateString === today,
                          "opacity-30": !isCurrentYear,
                        },
                      )}
                      style={{
                        backgroundColor: isCurrentYear ? color : "#f3f4f6",
                      }}
                      title={getTooltipText(dateString)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            {displayHabits.map((habit) => (
              <div
                key={habit._id}
                className="size-3 rounded-sm border border-gray-200"
                style={{ backgroundColor: habit.color }}
                title={habit.name}
              />
            ))}
          </div>
          <span>More</span>
        </div>

        <div className="text-xs text-gray-500">
          Hover over squares for details
        </div>
      </div>
    </div>
  );
}
