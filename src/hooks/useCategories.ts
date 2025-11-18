import { useState, useEffect } from 'react';
import { TransactionType } from '@/lib/finance';

export interface CustomCategory {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
}

const STORAGE_KEY = 'finance-tracker-categories';

const defaultCategories: CustomCategory[] = [
  { id: 'salary', name: 'Salário', type: 'income' },
  { id: 'freelance', name: 'Freelance', type: 'income' },
  { id: 'investment', name: 'Investimento', type: 'income' },
  { id: 'other-income', name: 'Outras Receitas', type: 'income' },
  { id: 'food', name: 'Alimentação', type: 'expense' },
  { id: 'transport', name: 'Transporte', type: 'expense' },
  { id: 'housing', name: 'Moradia', type: 'expense' },
  { id: 'entertainment', name: 'Entretenimento', type: 'expense' },
  { id: 'health', name: 'Saúde', type: 'expense' },
  { id: 'education', name: 'Educação', type: 'expense' },
  { id: 'shopping', name: 'Compras', type: 'expense' },
  { id: 'bills', name: 'Contas', type: 'expense' },
  { id: 'other-expense', name: 'Outras Despesas', type: 'expense' },
];

export function useCategories() {
  const [categories, setCategories] = useState<CustomCategory[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultCategories;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const addCategory = (name: string, type: TransactionType, icon?: string) => {
    const newCategory: CustomCategory = {
      id: crypto.randomUUID(),
      name,
      type,
      icon,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (id: string, name: string, icon?: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, icon } : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const getCategoriesByType = (type: TransactionType) => {
    return categories.filter((c) => c.type === type);
  };

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByType,
  };
}
