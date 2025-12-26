import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Goal {
  id: string;
  name: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  status: 'active' | 'completed';
  created_at: string;
  completed_at: string | null;
}

export interface GoalDeposit {
  id: string;
  goal_id: string;
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
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
      name: g.name,
      description: g.description,
      target_amount: Number(g.target_amount),
      current_amount: Number(g.current_amount),
      status: g.status as 'active' | 'completed',
      created_at: g.created_at,
      completed_at: g.completed_at,
    }));

    setGoals(formattedGoals);
    setLoading(false);
  };

  const addGoal = async (name: string, targetAmount: number, description?: string) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    const { error } = await supabase.from('goals').insert({
      user_id: user.id,
      name,
      description: description || null,
      target_amount: targetAmount,
    });

    if (error) {
      toast.error('Erro ao criar meta');
      console.error(error);
      return;
    }

    toast.success('Meta criada!');
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

  const updateGoal = async (id: string, name: string, targetAmount: number, description?: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('goals')
      .update({ 
        name, 
        target_amount: targetAmount,
        description: description || null 
      })
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
    refetch: fetchGoals,
  };
}

export function useGoalDeposits(goalId: string | null) {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<GoalDeposit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !goalId) {
      setDeposits([]);
      setLoading(false);
      return;
    }

    fetchDeposits();

    const channel = supabase
      .channel(`deposits-${goalId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goal_deposits',
          filter: `goal_id=eq.${goalId}`,
        },
        () => {
          fetchDeposits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, goalId]);

  const fetchDeposits = async () => {
    if (!user || !goalId) return;

    const { data, error } = await supabase
      .from('goal_deposits')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const formattedDeposits: GoalDeposit[] = (data || []).map((d) => ({
      id: d.id,
      goal_id: d.goal_id,
      amount: Number(d.amount),
      description: d.description,
      date: d.date,
      created_at: d.created_at,
    }));

    setDeposits(formattedDeposits);
    setLoading(false);
  };

  const addDeposit = async (amount: number, description?: string, date?: Date) => {
    if (!user || !goalId) {
      toast.error('Erro ao adicionar depósito');
      return;
    }

    const { error } = await supabase.from('goal_deposits').insert({
      user_id: user.id,
      goal_id: goalId,
      amount,
      description: description || null,
      date: date?.toISOString() || new Date().toISOString(),
    });

    if (error) {
      toast.error('Erro ao adicionar depósito');
      console.error(error);
      return;
    }

    toast.success('Depósito adicionado!');
  };

  const deleteDeposit = async (depositId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('goal_deposits')
      .delete()
      .eq('id', depositId)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Erro ao deletar depósito');
      console.error(error);
      return;
    }

    toast.success('Depósito removido!');
  };

  return {
    deposits,
    addDeposit,
    deleteDeposit,
    loading,
    refetch: fetchDeposits,
  };
}
