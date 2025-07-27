import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Menu, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import HabitCard from "@/components/habit-card";
import AddHabitModal from "@/components/add-habit-modal";
import EditHabitModal from "@/components/edit-habit-modal";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import RightSidebar from "@/components/right-sidebar";
import MobileNav from "@/components/mobile-nav";
import type { HabitWithCompletion } from "@shared/schema";

export default function Home() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitWithCompletion | null>(null);
  const [mobileSection, setMobileSection] = useState<"today" | "analytics" | "habits">("today");
  const isMobile = useIsMobile();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

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

  const handleEditHabit = (habit: HabitWithCompletion) => {
    setEditingHabit(habit);
    setShowEditModal(true);
  };

  const categories = Array.from(new Set(habits.map(h => h.category)));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/20 px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Check className="text-white text-sm" />
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">HabitFlow</h1>
          </div>
          <div className="flex items-center space-x-3">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user.profileImageUrl && (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm text-slate-600">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.email || 'User'}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-slate-600 hover:text-slate-800"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
            {isMobile && (
              <Button variant="ghost" size="sm" className="backdrop-blur-sm">
                <Menu className="h-4 w-4 text-slate-600" />
              </Button>
            )}
            <Button 
              onClick={() => setShowAddModal(true)} 
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary shadow-lg backdrop-blur-sm"
            >
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
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Today's Habits</h2>
                    <p className="text-slate-500 text-sm mt-1">{todayString}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
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
                  <div className="w-full bg-white/40 rounded-full h-2 backdrop-blur-sm">
                    <div 
                      className="bg-gradient-to-r from-secondary to-emerald-400 h-2 rounded-full transition-all duration-300 shadow-sm" 
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Today's Habit List */}
                <div className="space-y-1">
                  {todaysHabits.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p>No habits yet. Create your first habit to get started!</p>
                    </div>
                  ) : (
                    todaysHabits.map((habit) => (
                      <HabitCard key={habit.id} habit={habit} onEdit={handleEditHabit} />
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
        </main>

        {/* Right Sidebar - Desktop Only */}
        {!isMobile && (
          <RightSidebar 
            habits={habits}
            activeHabits={activeHabits}
            completedToday={completedToday}
            onEditHabit={handleEditHabit}
            categories={categories}
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

      {/* Modals */}
      <AddHabitModal 
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />
      
      <EditHabitModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        habit={editingHabit}
        categories={categories}
      />
    </div>
  );
}
