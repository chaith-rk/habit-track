import { 
  type Habit, 
  type InsertHabit, 
  type HabitCompletion, 
  type InsertHabitCompletion,
  type User,
  type UpsertUser,
  habits, 
  habitCompletions,
  users 
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Habits (now user-specific)
  getHabits(userId: string): Promise<Habit[]>;
  getHabit(id: string, userId: string): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit & { userId: string }): Promise<Habit>;
  updateHabit(id: string, userId: string, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: string, userId: string): Promise<boolean>;
  
  // Habit Completions (now user-specific)
  getHabitCompletions(userId: string, habitId?: string, date?: string): Promise<HabitCompletion[]>;
  createHabitCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  updateHabitCompletion(habitId: string, date: string, completed: boolean): Promise<HabitCompletion | undefined>;
  getHabitCompletionsByDateRange(userId: string, startDate: string, endDate: string): Promise<HabitCompletion[]>;
}

export class MemStorage implements IStorage {
  private habits: Map<string, Habit>;
  private habitCompletions: Map<string, HabitCompletion>;

  constructor() {
    this.habits = new Map();
    this.habitCompletions = new Map();
  }

  // Habits
  async getHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values());
  }

  async getHabit(id: string): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = randomUUID();
    const habit: Habit = {
      id,
      name: insertHabit.name,
      category: insertHabit.category,
      frequency: insertHabit.frequency || "daily",
      createdAt: new Date(),
    };
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: string, updateData: Partial<InsertHabit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;
    
    const updatedHabit = { ...habit, ...updateData };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: string): Promise<boolean> {
    const deleted = this.habits.delete(id);
    // Also delete all completions for this habit
    const completionKeys = Array.from(this.habitCompletions.keys());
    for (const key of completionKeys) {
      const completion = this.habitCompletions.get(key);
      if (completion && completion.habitId === id) {
        this.habitCompletions.delete(key);
      }
    }
    return deleted;
  }

  // Habit Completions
  async getHabitCompletions(habitId?: string, date?: string): Promise<HabitCompletion[]> {
    const completions = Array.from(this.habitCompletions.values());
    return completions.filter(completion => {
      if (habitId && completion.habitId !== habitId) return false;
      if (date && completion.date !== date) return false;
      return true;
    });
  }

  async createHabitCompletion(insertCompletion: InsertHabitCompletion): Promise<HabitCompletion> {
    const id = randomUUID();
    const completion: HabitCompletion = {
      id,
      habitId: insertCompletion.habitId,
      date: insertCompletion.date,
      completed: insertCompletion.completed ?? false,
      completedAt: insertCompletion.completed ? new Date() : null,
    };
    this.habitCompletions.set(id, completion);
    return completion;
  }

  async updateHabitCompletion(habitId: string, date: string, completed: boolean): Promise<HabitCompletion | undefined> {
    // Find existing completion
    const completionEntries = Array.from(this.habitCompletions.entries());
    for (const [key, completion] of completionEntries) {
      if (completion.habitId === habitId && completion.date === date) {
        const updated = {
          ...completion,
          completed,
          completedAt: completed ? new Date() : null,
        };
        this.habitCompletions.set(key, updated);
        return updated;
      }
    }
    
    // Create new completion if not found
    return this.createHabitCompletion({ habitId, date, completed });
  }

  async getHabitCompletionsByDateRange(startDate: string, endDate: string): Promise<HabitCompletion[]> {
    const completions = Array.from(this.habitCompletions.values());
    return completions.filter(completion => {
      return completion.date >= startDate && completion.date <= endDate;
    });
  }
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Habits (now user-specific)
  async getHabits(userId: string): Promise<Habit[]> {
    return await db.select().from(habits).where(eq(habits.userId, userId));
  }

  async getHabit(id: string, userId: string): Promise<Habit | undefined> {
    const [habit] = await db.select().from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)));
    return habit || undefined;
  }

  async createHabit(insertHabit: InsertHabit & { userId: string }): Promise<Habit> {
    const id = randomUUID();
    const [habit] = await db
      .insert(habits)
      .values({
        id,
        userId: insertHabit.userId,
        name: insertHabit.name,
        category: insertHabit.category,
        frequency: insertHabit.frequency || "daily",
        createdAt: new Date(),
      })
      .returning();
    return habit;
  }

  async updateHabit(id: string, userId: string, updateData: Partial<InsertHabit>): Promise<Habit | undefined> {
    const [habit] = await db
      .update(habits)
      .set(updateData)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();
    return habit || undefined;
  }

  async deleteHabit(id: string, userId: string): Promise<boolean> {
    const [deletedHabit] = await db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();
    
    if (deletedHabit) {
      // Also delete all completions for this habit
      await db.delete(habitCompletions).where(eq(habitCompletions.habitId, id));
      return true;
    }
    return false;
  }

  // Habit Completions (now user-aware through habit ownership)
  async getHabitCompletions(userId: string, habitId?: string, date?: string): Promise<HabitCompletion[]> {
    // Join with habits table to ensure user ownership
    const baseQuery = db.select({
      id: habitCompletions.id,
      habitId: habitCompletions.habitId,
      date: habitCompletions.date,
      completed: habitCompletions.completed,
      completedAt: habitCompletions.completedAt,
    })
    .from(habitCompletions)
    .innerJoin(habits, eq(habitCompletions.habitId, habits.id))
    .where(eq(habits.userId, userId));

    if (habitId && date) {
      return await baseQuery.where(and(
        eq(habits.userId, userId),
        eq(habitCompletions.habitId, habitId), 
        eq(habitCompletions.date, date)
      ));
    } else if (habitId) {
      return await baseQuery.where(and(
        eq(habits.userId, userId),
        eq(habitCompletions.habitId, habitId)
      ));
    } else if (date) {
      return await baseQuery.where(and(
        eq(habits.userId, userId),
        eq(habitCompletions.date, date)
      ));
    }
    
    return await baseQuery;
  }

  async createHabitCompletion(insertCompletion: InsertHabitCompletion): Promise<HabitCompletion> {
    const id = randomUUID();
    const [completion] = await db
      .insert(habitCompletions)
      .values({
        id,
        habitId: insertCompletion.habitId,
        date: insertCompletion.date,
        completed: insertCompletion.completed ?? false,
        completedAt: insertCompletion.completed ? new Date() : null,
      })
      .returning();
    return completion;
  }

  async updateHabitCompletion(habitId: string, date: string, completed: boolean): Promise<HabitCompletion | undefined> {
    // Try to update existing completion
    const [existing] = await db
      .update(habitCompletions)
      .set({ 
        completed, 
        completedAt: completed ? new Date() : null 
      })
      .where(and(eq(habitCompletions.habitId, habitId), eq(habitCompletions.date, date)))
      .returning();
    
    if (existing) {
      return existing;
    }
    
    // Create new completion if not found
    return this.createHabitCompletion({ habitId, date, completed });
  }

  async getHabitCompletionsByDateRange(userId: string, startDate: string, endDate: string): Promise<HabitCompletion[]> {
    return await db.select({
      id: habitCompletions.id,
      habitId: habitCompletions.habitId,
      date: habitCompletions.date,
      completed: habitCompletions.completed,
      completedAt: habitCompletions.completedAt,
    })
    .from(habitCompletions)
    .innerJoin(habits, eq(habitCompletions.habitId, habits.id))
    .where(and(
      eq(habits.userId, userId),
      eq(habitCompletions.date, startDate), // Simple comparison for now
      eq(habitCompletions.date, endDate)
    ));
  }
}

export const storage = new DatabaseStorage();
