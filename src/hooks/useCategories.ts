import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TransactionType } from '@/lib/finance';
import { toast } from 'sonner';

export interface CustomCategory {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
}

const defaultCategories: Omit<CustomCategory, 'id'>[] = [
  { name: 'Salário', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Investimento', type: 'income' },
  { name: 'Outras Receitas', type: 'income' },
  { name: 'Alimentação', type: 'expense' },
  { name: 'Transporte', type: 'expense' },
  { name: 'Moradia', type: 'expense' },
  { name: 'Entretenimento', type: 'expense' },
  { name: 'Saúde', type: 'expense' },
  { name: 'Educação', type: 'expense' },
  { name: 'Compras', type: 'expense' },
  { name: 'Contas', type: 'expense' },
  { name: 'Outras Despesas', type: 'expense' },
];

export function useCategories() {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Check auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!userId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;

      // If no categories exist, create default ones
      if (!data || data.length === 0) {
        await createDefaultCategories(userId);
        return;
      }

      setCategories(data.map(cat => ({
        id: cat.id,
        name: cat.name,
        type: cat.type as TransactionType,
        icon: cat.icon ?? undefined,
      })));
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Create default categories for new users
  const createDefaultCategories = async (uid: string) => {
    try {
      const categoriesToInsert = defaultCategories.map(cat => ({
        user_id: uid,
        name: cat.name,
        type: cat.type,
        icon: cat.icon ?? null,
      }));

      const { error } = await supabase
        .from('categories')
        .insert(categoriesToInsert);

      if (error) throw error;

      // Fetch again after creating defaults
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', uid)
        .order('name');

      if (data) {
        setCategories(data.map(cat => ({
          id: cat.id,
          name: cat.name,
          type: cat.type as TransactionType,
          icon: cat.icon ?? undefined,
        })));
      }
    } catch (error) {
      console.error('Error creating default categories:', error);
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    if (!userId) return;

    fetchCategories();

    const channel = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchCategories]);

  const addCategory = async (name: string, type: TransactionType, icon?: string) => {
    if (!userId) {
      toast.error('Você precisa estar logado');
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          user_id: userId,
          name,
          type,
          icon: icon ?? null,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Erro ao adicionar categoria');
    }
  };

  const updateCategory = async (id: string, name: string, icon?: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ name, icon: icon ?? null })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Erro ao atualizar categoria');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const getCategoriesByType = (type: TransactionType) => {
    return categories.filter((c) => c.type === type);
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByType,
  };
}
