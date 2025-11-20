import { useState, useEffect } from 'react';
import { Category } from '@/lib/finance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Goal {
  id: string;
  category: Category;
  limit: number;
  month: string;
}

export function useSupabaseGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    fetchGoals();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar metas');
      console.error(error);
      setLoading(false);
      return;
    }

    const formattedGoals: Goal[] = (data || []).map((g) => ({
      id: g.id,
      category: g.category as Category,
      limit: Number(g.limit_amount),
      month: g.month,
    }));

    setGoals(formattedGoals);
    setLoading(false);
  };

  const addGoal = async (category: Category, limit: number, month: string) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    // Delete existing goal for same category and month
    await supabase
      .from('goals')
      .delete()
      .eq('user_id', user.id)
      .eq('category', category)
      .eq('month', month);

    const { error } = await supabase.from('goals').insert({
      user_id: user.id,
      category,
      limit_amount: limit,
      month,
    });

    if (error) {
      toast.error('Erro ao adicionar meta');
      console.error(error);
      return;
    }

    toast.success('Meta adicionada!');
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Erro ao deletar meta');
      console.error(error);
      return;
    }

    toast.success('Meta deletada!');
  };

  const updateGoal = async (id: string, limit: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('goals')
      .update({ limit_amount: limit })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Erro ao atualizar meta');
      console.error(error);
      return;
    }

    toast.success('Meta atualizada!');
  };

  return {
    goals,
    addGoal,
    deleteGoal,
    updateGoal,
    loading,
  };
}
