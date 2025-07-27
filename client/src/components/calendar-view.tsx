import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HabitCompletion } from "@shared/schema";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = startOfMonth.toISOString().split('T')[0];
  const endDate = endOfMonth.toISOString().split('T')[0];

  const { data: completions = [] } = useQuery<HabitCompletion[]>({
    queryKey: ["/api/completions", { startDate, endDate }],
  });

  const monthName = currentDate.toLocaleDateString("en-US", { 
    month: "long", 
    year: "numeric" 
  });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate calendar days
  const firstDayOfMonth = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();
  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getCompletionsForDay = (day: number) => {
    const dateString = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    return completions.filter(c => c.date === dateString);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  return (
    <section>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Calendar View</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousMonth}
              className="p-2 hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            </Button>
            <span className="text-sm font-medium text-slate-700 px-3">
              {monthName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100"
            >
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </Button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-slate-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={index} className="aspect-square p-1" />;
            }

            const dayCompletions = getCompletionsForDay(day);
            const completedCount = dayCompletions.filter(c => c.completed).length;
            const totalCount = dayCompletions.length;
            const today = isToday(day);

            return (
              <div key={day} className="aspect-square p-1">
                <div className={`w-full h-full rounded-lg border p-1 hover:border-slate-300 transition-colors cursor-pointer ${
                  today 
                    ? "border-2 border-primary bg-blue-50" 
                    : "border border-slate-200"
                }`}>
                  <div className={`text-xs font-medium mb-1 ${
                    today ? "text-primary" : "text-slate-700"
                  }`}>
                    {day}
                  </div>
                  <div className="flex flex-wrap gap-0.5">
                    {Array.from({ length: Math.min(totalCount, 6) }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${
                          i < completedCount ? "bg-secondary" : "bg-slate-300"
                        }`}
                      />
                    ))}
                    {totalCount > 6 && (
                      <div className="text-xs text-slate-500">+</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
