import { useState } from "react";
import { Clock, CheckCircle, List, Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { HabitWithCompletion } from "@shared/schema";

interface RightSidebarProps {
  habits: HabitWithCompletion[];
  activeHabits: HabitWithCompletion[];
  completedToday: HabitWithCompletion[];
  onEditHabit: (habit: HabitWithCompletion) => void;
  categories: string[];
}

export default function RightSidebar({ habits, activeHabits, completedToday, onEditHabit, categories }: RightSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const allCategories = ["All", ...categories];

  const filteredHabits = habits.filter(habit => 
    selectedCategory === "All" || habit.category === selectedCategory
  );

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      // In a real app, you'd save this to your backend
      setNewCategory("");
      setShowAddCategory(false);
    }
  };

  return (
    <aside className="w-80 p-6 pl-0">
      <div className="space-y-4">
        {/* Active Habits Panel */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <Clock className="text-amber-500 mr-2 h-4 w-4" />
            Active ({activeHabits.length})
          </h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {activeHabits.length === 0 ? (
              <p className="text-xs text-slate-500">All completed!</p>
            ) : (
              activeHabits.map((habit) => (
                <div key={habit.id} className="group flex items-center py-1 px-2 rounded-lg hover:bg-white/40 transition-colors cursor-pointer">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-900 truncate">{habit.name}</div>
                    <div className="text-xs text-slate-500">{habit.completionRate}%</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onEditHabit(habit)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Today Panel */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <CheckCircle className="text-secondary mr-2 h-4 w-4" />
            Completed ({completedToday.length})
          </h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {completedToday.length === 0 ? (
              <p className="text-xs text-slate-500">None yet today</p>
            ) : (
              completedToday.map((habit) => (
                <div key={habit.id} className="group flex items-center py-1 px-2 rounded-lg hover:bg-white/40 transition-colors cursor-pointer">
                  <div className="w-2 h-2 bg-secondary rounded-full mr-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-900 truncate opacity-60">{habit.name}</div>
                    <div className="text-xs text-slate-500">{habit.completionRate}%</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onEditHabit(habit)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Categories Panel */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center">
              <List className="text-primary mr-2 h-4 w-4" />
              Categories
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowAddCategory(!showAddCategory)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {showAddCategory && (
            <div className="mb-3 flex gap-2">
              <Input
                placeholder="New category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="h-6 text-xs bg-white/70 backdrop-blur-sm border-white/30"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleAddCategory}
              >
                Add
              </Button>
            </div>
          )}
          
          <div className="flex flex-wrap gap-1 mb-3">
            {allCategories.map((category) => (
              <Button
                key={category}
                variant="ghost"
                size="sm"
                className={cn(
                  "px-2 py-1 text-xs rounded-md font-medium h-auto",
                  selectedCategory === category
                    ? "bg-blue-100/70 text-blue-700 backdrop-blur-sm"
                    : "bg-white/40 text-slate-600 hover:bg-white/60 backdrop-blur-sm"
                )}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {filteredHabits.length === 0 ? (
              <p className="text-xs text-slate-500">No habits in this category</p>
            ) : (
              filteredHabits.map((habit) => (
                <div key={habit.id} className="group flex items-center py-1 px-2 rounded-lg hover:bg-white/40 transition-colors cursor-pointer">
                  <div className={cn(
                    "w-2 h-2 rounded-full mr-2 flex-shrink-0",
                    habit.isCompletedToday ? "bg-secondary" : "bg-amber-400"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-900 truncate">{habit.name}</div>
                    <div className="text-xs text-slate-500">{habit.completionRate}%</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onEditHabit(habit)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
