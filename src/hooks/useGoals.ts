import { useState, useEffect } from 'react';
import { Category } from '@/lib/finance';

export interface Goal {
  id: string;
  category: Category;
  limit: number;
  month: string; // formato: 'YYYY-MM'
}

const STORAGE_KEY = 'finance-tracker-goals';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const addGoal = (category: Category, limit: number, month: string) => {
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      category,
      limit,
      month,
    };
    setGoals((prev) => [...prev.filter(g => !(g.category === category && g.month === month)), newGoal]);
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const updateGoal = (id: string, limit: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, limit } : g))
    );
  };

  return {
    goals,
    addGoal,
    deleteGoal,
    updateGoal,
  };
}
