import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface HeatmapCalendarProps {
  selectedHabits: Id<"habits">[];
}

export function HeatmapCalendar({ selectedHabits }: HeatmapCalendarProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const allHabits = useQuery(api.habits.getHabits) || [];

  // Generate date range for the entire year
  const dateRange = useMemo(() => {
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);

    // Start from the Sunday before the first day of the year
    const firstSunday = new Date(startDate);
    firstSunday.setDate(startDate.getDate() - startDate.getDay());

    // End on the Saturday after the last day of the year
    const lastSaturday = new Date(endDate);
    lastSaturday.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const dates = [];
    const current = new Date(firstSunday);
    while (current <= lastSaturday) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return {
      dates,
      startDate: firstSunday.toISOString().split("T")[0],
      endDate: lastSaturday.toISOString().split("T")[0],
    };
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

  // Calculate completion intensity for each date
  const getCompletionIntensity = (date: string) => {
    const dateCompletions = completions.filter(
      (c) => c.date === date && c.completed,
    );
    const totalPossible = displayHabits.length;

    if (totalPossible === 0) return 0;

    const completionRate = dateCompletions.length / totalPossible;

    // Return intensity level (0-4)
    if (completionRate === 0) return 0;
    if (completionRate <= 0.25) return 1;
    if (completionRate <= 0.5) return 2;
    if (completionRate <= 0.75) return 3;
    return 4;
  };

  const getIntensityColor = (intensity: number) => {
    const colors = [
      "#ebedf0", // 0 - no activity
      "#9be9a8", // 1 - low activity
      "#40c463", // 2 - medium activity
      "#30a14e", // 3 - high activity
      "#216e39", // 4 - very high activity
    ];
    return colors[intensity];
  };

  const getTooltipText = (date: string, intensity: number) => {
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
      (date) => date.getFullYear() === selectedYear,
    );
    const totalDays = yearDates.length;
    const activeDays = yearDates.filter((date) => {
      const dateString = date.toISOString().split("T")[0];
      return getCompletionIntensity(dateString) > 0;
    }).length;

    const currentStreak = (() => {
      let streak = 0;
      const today = new Date();
      const current = new Date(today);

      while (current >= yearDates[0]) {
        const dateString = current.toISOString().split("T")[0];
        if (getCompletionIntensity(dateString) > 0) {
          streak++;
        } else {
          break;
        }
        current.setDate(current.getDate() - 1);
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
  }, [dateRange.dates, selectedYear, completions, displayHabits]);

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
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Month labels */}
        <div className="mb-2 flex justify-between text-xs text-gray-500">
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

        {/* Heatmap grid */}
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="mr-2 flex flex-col gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
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

          {/* Calendar grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((date, dayIndex) => {
                  const dateString = date.toISOString().split("T")[0];
                  const intensity = getCompletionIntensity(dateString);
                  const isCurrentYear = date.getFullYear() === selectedYear;

                  return (
                    <div
                      key={dateString}
                      className={`size-3 rounded-sm border border-gray-200 ${
                        !isCurrentYear ? "opacity-30" : ""
                      }`}
                      style={{
                        backgroundColor: isCurrentYear
                          ? getIntensityColor(intensity)
                          : "#f3f4f6",
                      }}
                      title={getTooltipText(dateString, intensity)}
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
            {[0, 1, 2, 3, 4].map((intensity) => (
              <div
                key={intensity}
                className="size-3 rounded-sm border border-gray-200"
                style={{ backgroundColor: getIntensityColor(intensity) }}
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
