import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface HeatmapCalendarProps {
  selectedHabits: Id<"habits">[];
  selectedSubHabits: Id<"subHabits">[];
}

export function HeatmapCalendar({ selectedHabits, selectedSubHabits }: HeatmapCalendarProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const habits = useQuery(api.habits.getHabits) || [];
  const subHabits = useQuery(api.habits.getAllSubHabits) || [];

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
      startDate: firstSunday.toISOString().split('T')[0],
      endDate: lastSaturday.toISOString().split('T')[0],
    };
  }, [selectedYear]);

  const completions = useQuery(api.completions.getCompletions, {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    habitIds: selectedHabits.length > 0 ? selectedHabits : undefined,
    subHabitIds: selectedSubHabits.length > 0 ? selectedSubHabits : undefined,
  }) || [];

  // Filter habits and sub-habits based on selection
  const displayHabits = selectedHabits.length > 0 
    ? habits.filter(h => selectedHabits.includes(h._id))
    : habits;
  
  const displaySubHabits = selectedSubHabits.length > 0
    ? subHabits.filter(sh => selectedSubHabits.includes(sh._id))
    : subHabits.filter(sh => 
        selectedHabits.length === 0 || selectedHabits.includes(sh.habitId)
      );

  // Calculate completion intensity for each date
  const getCompletionIntensity = (date: string) => {
    const dateCompletions = completions.filter(c => c.date === date && c.completed);
    const totalPossible = displayHabits.length + displaySubHabits.length;
    
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
      '#ebedf0', // 0 - no activity
      '#9be9a8', // 1 - low activity
      '#40c463', // 2 - medium activity
      '#30a14e', // 3 - high activity
      '#216e39', // 4 - very high activity
    ];
    return colors[intensity];
  };

  const getTooltipText = (date: string, intensity: number) => {
    const dateObj = new Date(date);
    const dateCompletions = completions.filter(c => c.date === date && c.completed);
    const totalPossible = displayHabits.length + displaySubHabits.length;
    
    return `${dateObj.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
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
    const yearDates = dateRange.dates.filter(date => date.getFullYear() === selectedYear);
    const totalDays = yearDates.length;
    const activeDays = yearDates.filter(date => {
      const dateString = date.toISOString().split('T')[0];
      return getCompletionIntensity(dateString) > 0;
    }).length;
    
    const currentStreak = (() => {
      let streak = 0;
      const today = new Date();
      const current = new Date(today);
      
      while (current >= yearDates[0]) {
        const dateString = current.toISOString().split('T')[0];
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
      completionRate: totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0,
    };
  }, [dateRange.dates, selectedYear, completions, displayHabits, displaySubHabits]);

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 2; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Activity Heatmap</h2>
          <p className="text-sm text-gray-600 mt-1">
            {stats.activeDays} active days in {selectedYear} • {stats.completionRate}% completion rate
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Current streak: <span className="font-semibold text-green-600">{stats.currentStreak} days</span>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Month labels */}
      <div className="flex justify-between mb-2 text-xs text-gray-500">
        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
          <div key={month} className="flex-1 text-center">
            {index % 2 === 0 ? month : ''}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-2">
          <div className="h-3"></div> {/* Spacer for month labels */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={day} className="h-3 text-xs text-gray-500 flex items-center">
              {index % 2 === 1 ? day : ''}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((date, dayIndex) => {
                const dateString = date.toISOString().split('T')[0];
                const intensity = getCompletionIntensity(dateString);
                const isCurrentYear = date.getFullYear() === selectedYear;
                
                return (
                  <div
                    key={dateString}
                    className={`w-3 h-3 rounded-sm border border-gray-200 ${
                      !isCurrentYear ? 'opacity-30' : ''
                    }`}
                    style={{ 
                      backgroundColor: isCurrentYear ? getIntensityColor(intensity) : '#f3f4f6' 
                    }}
                    title={getTooltipText(dateString, intensity)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(intensity => (
              <div
                key={intensity}
                className="w-3 h-3 rounded-sm border border-gray-200"
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
