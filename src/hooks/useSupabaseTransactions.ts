import { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, Category } from '@/lib/finance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useSupabaseTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    fetchTransactions();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar transações');
      console.error(error);
      setLoading(false);
      return;
    }

    const formattedTransactions: Transaction[] = (data || []).map((t) => ({
      id: t.id,
      description: t.description,
      amount: Number(t.amount),
      type: t.type as TransactionType,
      category: t.category as Category,
      date: new Date(t.date),
    }));

    setTransactions(formattedTransactions);
    setLoading(false);
  };

  const addTransaction = async (
    description: string,
    amount: number,
    type: TransactionType,
    category: Category,
    date: Date,
    bankId?: string
  ) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      description,
      amount,
      type,
      category,
      date: date.toISOString(),
      bank_id: bankId || null,
    });

    if (error) {
      toast.error('Erro ao adicionar transação');
      console.error(error);
      return;
    }

    toast.success('Transação adicionada!');
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Erro ao deletar transação');
      console.error(error);
      return;
    }

    toast.success('Transação deletada!');
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<Omit<Transaction, 'id'>>
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from('transactions')
      .update({
        description: updates.description,
        amount: updates.amount,
        type: updates.type,
        category: updates.category,
        date: updates.date?.toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Erro ao atualizar transação');
      console.error(error);
      return;
    }

    toast.success('Transação atualizada!');
  };

  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    return { income, expenses, balance };
  }, [transactions]);

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    stats,
    loading,
  };
}
