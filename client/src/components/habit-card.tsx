import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Edit2, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { HabitWithCompletion } from "@shared/schema";

interface HabitCardProps {
  habit: HabitWithCompletion;
  onEdit: (habit: HabitWithCompletion) => void;
}

export default function HabitCard({ habit, onEdit }: HabitCardProps) {
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

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/habits/${habit.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Habit deleted",
        description: `${habit.name} has been removed`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete habit",
        variant: "destructive",
      });
    },
  });

  const handleToggle = () => {
    toggleMutation.mutate(!habit.isCompletedToday);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${habit.name}"?`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className={cn(
      "group flex items-center py-1 px-2 rounded-lg border transition-all duration-200 backdrop-blur-md",
      habit.isCompletedToday 
        ? "bg-emerald-50/70 border-emerald-200/60 backdrop-blur-sm" 
        : "bg-white/60 border-slate-200/40 hover:border-slate-300/60 hover:bg-white/80"
    )}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "w-3 h-3 rounded-full mr-2 flex-shrink-0 p-0 border transition-all",
          habit.isCompletedToday
            ? "bg-secondary hover:bg-secondary/90 border-secondary"
            : "border-slate-300 hover:border-primary hover:bg-primary/5"
        )}
        onClick={handleToggle}
        disabled={toggleMutation.isPending}
      >
        {habit.isCompletedToday && (
          <Check className="h-2 w-2 text-white" />
        )}
      </Button>
      
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "text-xs font-medium text-slate-900 truncate",
          habit.isCompletedToday && "line-through opacity-60"
        )}>
          {habit.name}
        </h4>
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 truncate">
            {habit.category} • {habit.completionRate}%
          </p>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={() => onEdit(habit)}>
            <Edit2 className="h-3 w-3 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-3 w-3 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
