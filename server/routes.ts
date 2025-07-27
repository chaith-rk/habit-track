import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertHabitSchema, insertHabitCompletionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Get all habits (protected)
  app.get("/api/habits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habits = await storage.getHabits(userId);
      const today = new Date().toISOString().split('T')[0];
      
      // Enrich habits with today's completion status and stats
      const enrichedHabits = await Promise.all(
        habits.map(async (habit) => {
          const todayCompletion = await storage.getHabitCompletions(userId, habit.id, today);
          const allCompletions = await storage.getHabitCompletions(userId, habit.id);
          
          const isCompletedToday = todayCompletion.length > 0 && todayCompletion[0].completed;
          const completionRate = allCompletions.length > 0 
            ? (allCompletions.filter(c => c.completed).length / allCompletions.length) * 100 
            : 0;

          return {
            ...habit,
            isCompletedToday,
            completionRate: Math.round(completionRate),
          };
        })
      );
      
      res.json(enrichedHabits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  // Create habit (protected)
  app.post("/api/habits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit({ ...validatedData, userId });
      res.status(201).json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create habit" });
      }
    }
  });

  // Update habit (protected)
  app.patch("/api/habits/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const validatedData = insertHabitSchema.partial().parse(req.body);
      const habit = await storage.updateHabit(id, userId, validatedData);
      
      if (!habit) {
        res.status(404).json({ message: "Habit not found" });
        return;
      }
      
      res.json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update habit" });
      }
    }
  });

  // Delete habit (protected)
  app.delete("/api/habits/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const deleted = await storage.deleteHabit(id, userId);
      
      if (!deleted) {
        res.status(404).json({ message: "Habit not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  // Toggle habit completion (protected)
  app.post("/api/habits/:id/toggle", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { date, completed } = req.body;
      
      if (!date || typeof completed !== "boolean") {
        res.status(400).json({ message: "Date and completed status are required" });
        return;
      }

      const habit = await storage.getHabit(id, userId);
      if (!habit) {
        res.status(404).json({ message: "Habit not found" });
        return;
      }

      const completion = await storage.updateHabitCompletion(id, date, completed);
      res.json(completion);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle habit completion" });
    }
  });

  // Get habit completions for date range (protected)
  app.get("/api/completions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate, habitId } = req.query;
      
      if (!startDate || !endDate) {
        res.status(400).json({ message: "Start date and end date are required" });
        return;
      }

      let completions;
      if (habitId) {
        completions = await storage.getHabitCompletions(userId, habitId as string);
        completions = completions.filter(c => c.date >= startDate && c.date <= endDate);
      } else {
        completions = await storage.getHabitCompletionsByDateRange(userId, startDate as string, endDate as string);
      }
      
      res.json(completions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch completions" });
    }
  });

  // Get analytics data (protected)
  app.get("/api/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habits = await storage.getHabits(userId);
      const today = new Date().toISOString().split('T')[0];
      
      // Get last 7 days for weekly progress
      const weekDays = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        weekDays.push(date.toISOString().split('T')[0]);
      }

      const weeklyProgress = await Promise.all(
        weekDays.map(async (date) => {
          const dayCompletions = await storage.getHabitCompletions(userId, undefined, date);
          const completed = dayCompletions.filter(c => c.completed).length;
          const total = habits.length;
          return {
            date,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
          };
        })
      );

      // Category distribution
      const categoryStats = habits.reduce((acc, habit) => {
        acc[habit.category] = (acc[habit.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Overall stats
      const todayCompletions = await storage.getHabitCompletions(userId, undefined, today);
      const completedToday = todayCompletions.filter(c => c.completed).length;
      const totalHabits = habits.length;
      
      // Calculate overall completion rate
      const allCompletions = await storage.getHabitCompletions(userId);
      const overallCompletionRate = allCompletions.length > 0 
        ? Math.round((allCompletions.filter(c => c.completed).length / allCompletions.length) * 100)
        : 0;

      res.json({
        totalHabits,
        completedToday,
        overallCompletionRate,
        weeklyProgress,
        categoryStats,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
