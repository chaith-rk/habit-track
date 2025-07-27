import { useState } from "react";
import { Clock, CheckCircle, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HabitWithCompletion } from "@shared/schema";

interface RightSidebarProps {
  habits: HabitWithCompletion[];
  activeHabits: HabitWithCompletion[];
  completedToday: HabitWithCompletion[];
}

const categories = ["All", "Health", "Learning", "Wellness", "Productivity", "Social"];

export default function RightSidebar({ habits, activeHabits, completedToday }: RightSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredHabits = habits.filter(habit => 
    selectedCategory === "All" || habit.category === selectedCategory
  );

  return (
    <aside className="w-80 p-6 pl-0">
      <div className="space-y-6">
        {/* Active Habits Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
            <Clock className="text-amber-500 mr-2 h-4 w-4" />
            Active Habits
          </h3>
          <div className="space-y-2">
            {activeHabits.length === 0 ? (
              <p className="text-sm text-slate-500">All habits completed for today!</p>
            ) : (
              activeHabits.map((habit) => (
                <div key={habit.id} className="flex items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-3 h-3 bg-amber-400 rounded-full mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{habit.name}</div>
                    <div className="text-xs text-slate-500">{habit.category}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Today Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
            <CheckCircle className="text-secondary mr-2 h-4 w-4" />
            Completed Today
          </h3>
          <div className="space-y-2">
            {completedToday.length === 0 ? (
              <p className="text-sm text-slate-500">No habits completed yet today.</p>
            ) : (
              completedToday.map((habit) => (
                <div key={habit.id} className="flex items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-3 h-3 bg-secondary rounded-full mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{habit.name}</div>
                    <div className="text-xs text-slate-500">{habit.category}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* All Habits Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center">
              <List className="text-primary mr-2 h-4 w-4" />
              All Habits
            </h3>
            <span className="text-xs text-slate-500">{habits.length} total</span>
          </div>
          
          {/* Category filters */}
          <div className="flex flex-wrap gap-1 mb-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant="ghost"
                size="sm"
                className={cn(
                  "px-2 py-1 text-xs rounded-md font-medium h-auto",
                  selectedCategory === category
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredHabits.length === 0 ? (
              <p className="text-sm text-slate-500">No habits in this category.</p>
            ) : (
              filteredHabits.map((habit) => (
                <div key={habit.id} className="flex items-center p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className={cn(
                    "w-3 h-3 rounded-full mr-3 flex-shrink-0",
                    habit.isCompletedToday ? "bg-secondary" : "bg-amber-400"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{habit.name}</div>
                    <div className="text-xs text-slate-500">
                      {habit.category} • {habit.completionRate}% completion
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
