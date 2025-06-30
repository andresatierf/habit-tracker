import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface HabitCalendarProps {
  selectedHabits: Id<"habits">[];
  selectedSubHabits: Id<"subHabits">[];
}

export function HabitCalendar({ selectedHabits, selectedSubHabits }: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const habits = useQuery(api.habits.getHabits) || [];
  const subHabits = useQuery(api.habits.getAllSubHabits) || [];
  
  const toggleCompletion = useMutation(api.completions.toggleCompletion);

  // Generate date range for the current month
  const dateRange = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay())); // End on Saturday
    
    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return {
      dates,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }, [currentDate]);

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

  const getCompletionForDate = (date: string, habitId?: Id<"habits">, subHabitId?: Id<"subHabits">) => {
    return completions.find(c => 
      c.date === date && 
      c.habitId === habitId && 
      c.subHabitId === subHabitId
    );
  };

  const handleToggleCompletion = async (date: string, habitId?: Id<"habits">, subHabitId?: Id<"subHabits">) => {
    await toggleCompletion({ date, habitId, subHabitId });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {dateRange.dates.map(date => {
          const dateString = date.toISOString().split('T')[0];
          const dayNumber = date.getDate();
          
          return (
            <div
              key={dateString}
              className={`min-h-[120px] p-1 border border-gray-100 ${
                !isCurrentMonth(date) ? 'bg-gray-50' : 'bg-white'
              } ${isToday(date) ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                !isCurrentMonth(date) ? 'text-gray-400' : 'text-gray-900'
              }`}>
                {dayNumber}
              </div>
              
              <div className="space-y-1">
                {/* Habits */}
                {displayHabits.map(habit => {
                  const completion = getCompletionForDate(dateString, habit._id);
                  const isCompleted = completion?.completed || false;
                  
                  return (
                    <button
                      key={`habit-${habit._id}`}
                      onClick={() => handleToggleCompletion(dateString, habit._id)}
                      className={`w-full text-left p-1 rounded text-xs transition-colors ${
                        isCompleted 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={{
                        borderLeft: `3px solid ${habit.color}`,
                      }}
                    >
                      <span className="mr-1">{habit.icon}</span>
                      {habit.name}
                    </button>
                  );
                })}

                {/* Sub-habits */}
                {displaySubHabits.map(subHabit => {
                  const completion = getCompletionForDate(dateString, undefined, subHabit._id);
                  const isCompleted = completion?.completed || false;
                  
                  return (
                    <button
                      key={`subhabit-${subHabit._id}`}
                      onClick={() => handleToggleCompletion(dateString, undefined, subHabit._id)}
                      className={`w-full text-left p-1 rounded text-xs transition-colors ${
                        isCompleted 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={{
                        borderLeft: `3px solid ${subHabit.color}`,
                      }}
                    >
                      <span className="mr-1">{subHabit.icon}</span>
                      {subHabit.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
