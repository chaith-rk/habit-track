import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import HabitCard from "@/components/habit-card";
import AddHabitModal from "@/components/add-habit-modal";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import CalendarView from "@/components/calendar-view";
import RightSidebar from "@/components/right-sidebar";
import MobileNav from "@/components/mobile-nav";
import type { HabitWithCompletion } from "@shared/schema";

export default function Home() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [mobileSection, setMobileSection] = useState<"today" | "analytics" | "calendar" | "habits">("today");
  const isMobile = useIsMobile();

  const { data: habits = [], isLoading } = useQuery<HabitWithCompletion[]>({
    queryKey: ["/api/habits"],
  });

  const today = new Date();
  const todayString = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const todaysHabits = habits.filter(habit => habit.frequency === "daily");
  const completedToday = todaysHabits.filter(habit => habit.isCompletedToday);
  const activeHabits = todaysHabits.filter(habit => !habit.isCompletedToday);

  const progressPercentage = todaysHabits.length > 0 
    ? Math.round((completedToday.length / todaysHabits.length) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Check className="text-white text-sm" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">HabitFlow</h1>
          </div>
          <div className="flex items-center space-x-3">
            {isMobile && (
              <Button variant="ghost" size="sm">
                <Menu className="h-4 w-4 text-slate-600" />
              </Button>
            )}
            <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-blue-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Habit
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 lg:pr-0">
          {/* Today's Habits Section */}
          {(!isMobile || mobileSection === "today") && (
            <section className="mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Today's Habits</h2>
                    <p className="text-slate-500 text-sm mt-1">{todayString}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {completedToday.length}/{todaysHabits.length}
                    </div>
                    <div className="text-xs text-slate-500">completed</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Daily Progress</span>
                    <span className="text-sm text-slate-500">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Today's Habit List */}
                <div className="space-y-2">
                  {todaysHabits.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p>No habits yet. Create your first habit to get started!</p>
                    </div>
                  ) : (
                    todaysHabits.map((habit) => (
                      <HabitCard key={habit.id} habit={habit} />
                    ))
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Analytics Section */}
          {(!isMobile || mobileSection === "analytics") && (
            <AnalyticsDashboard />
          )}

          {/* Calendar Section */}
          {(!isMobile || mobileSection === "calendar") && (
            <CalendarView />
          )}
        </main>

        {/* Right Sidebar - Desktop Only */}
        {!isMobile && (
          <RightSidebar 
            habits={habits}
            activeHabits={activeHabits}
            completedToday={completedToday}
          />
        )}
      </div>

      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNav 
          currentSection={mobileSection}
          onSectionChange={setMobileSection}
          habits={habits}
        />
      )}

      {/* Add Habit Modal */}
      <AddHabitModal 
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />
    </div>
  );
}
