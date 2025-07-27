import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { HabitWithCompletion } from "@shared/schema";

interface HabitCardProps {
  habit: HabitWithCompletion;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];

  const toggleMutation = useMutation({
    mutationFn: async (completed: boolean) => {
      return apiRequest("POST", `/api/habits/${habit.id}/toggle`, {
        date: today,
        completed,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: habit.isCompletedToday ? "Habit unmarked" : "Habit completed!",
        description: habit.isCompletedToday 
          ? `${habit.name} marked as incomplete`
          : `Great job completing ${habit.name}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update habit completion",
        variant: "destructive",
      });
    },
  });

  const handleToggle = () => {
    toggleMutation.mutate(!habit.isCompletedToday);
  };

  return (
    <div className={cn(
      "flex items-center p-3 rounded-lg border transition-colors",
      habit.isCompletedToday 
        ? "bg-emerald-50 border-emerald-200" 
        : "bg-white border-slate-200 hover:border-slate-300"
    )}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "w-5 h-5 rounded-full mr-3 flex-shrink-0 p-0",
          habit.isCompletedToday
            ? "bg-secondary hover:bg-secondary/90"
            : "border-2 border-slate-300 hover:border-primary"
        )}
        onClick={handleToggle}
        disabled={toggleMutation.isPending}
      >
        {habit.isCompletedToday && (
          <Check className="h-3 w-3 text-white" />
        )}
      </Button>
      
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "text-sm font-medium text-slate-900",
          habit.isCompletedToday && "line-through"
        )}>
          {habit.name}
        </h4>
        <p className="text-xs text-slate-500">
          {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)} • {habit.category}
        </p>
      </div>
      
      <div className={cn(
        "text-xs font-medium",
        habit.isCompletedToday ? "text-emerald-600" : "text-slate-400"
      )}>
        {habit.isCompletedToday ? "Completed" : "Pending"}
      </div>
    </div>
  );
}
