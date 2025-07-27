import { Home, BarChart3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HabitWithCompletion } from "@shared/schema";

interface MobileNavProps {
  currentSection: "today" | "analytics" | "habits";
  onSectionChange: (section: "today" | "analytics" | "habits") => void;
  habits: HabitWithCompletion[];
}

export default function MobileNav({ currentSection, onSectionChange, habits }: MobileNavProps) {
  const navItems = [
    { id: "today" as const, icon: Home, label: "Today" },
    { id: "analytics" as const, icon: BarChart3, label: "Analytics" },
    { id: "habits" as const, icon: List, label: "Habits" },
  ];

  return (
    <>
      {/* Mobile Habits Section */}
      {currentSection === "habits" && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 z-40 pt-16 pb-16 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Active Habits */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4">
              <h3 className="text-sm font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
                Active Habits ({habits.filter(h => !h.isCompletedToday).length})
              </h3>
              <div className="space-y-2">
                {habits.filter(h => !h.isCompletedToday).map((habit) => (
                  <div key={habit.id} className="flex items-center p-2 rounded-lg bg-white/40 backdrop-blur-sm border border-white/30">
                    <div className="w-3 h-3 bg-amber-400 rounded-full mr-3" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">{habit.name}</div>
                      <div className="text-xs text-slate-500">{habit.category} • {habit.completionRate}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Today */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4">
              <h3 className="text-sm font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
                Completed Today ({habits.filter(h => h.isCompletedToday).length})
              </h3>
              <div className="space-y-2">
                {habits.filter(h => h.isCompletedToday).map((habit) => (
                  <div key={habit.id} className="flex items-center p-2 rounded-lg bg-emerald-100/60 backdrop-blur-sm border border-emerald-200/40">
                    <div className="w-3 h-3 bg-secondary rounded-full mr-3" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900 opacity-70">{habit.name}</div>
                      <div className="text-xs text-slate-500">{habit.category} • {habit.completionRate}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-t border-white/20 px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center p-2 h-auto backdrop-blur-sm rounded-lg",
                  currentSection === item.id 
                    ? "text-primary bg-white/50" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/30"
                )}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
