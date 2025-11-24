import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface Bank {
  id: string;
  name: string;
  initial_balance: number;
  color: string;
  icon?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useSupabaseBanks = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBanks = async () => {
    if (!user) {
      setBanks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBanks(data || []);
    } catch (error) {
      console.error('Erro ao buscar bancos:', error);
      toast.error('Erro ao carregar bancos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();

    const channel = supabase
      .channel('banks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'banks',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchBanks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addBank = async (name: string, initialBalance: number, color: string, icon?: string) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    try {
      const { error } = await supabase.from('banks').insert([
        {
          name,
          initial_balance: initialBalance,
          color,
          icon,
          user_id: user.id,
        },
      ]);

      if (error) throw error;
      toast.success('Banco adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar banco:', error);
      toast.error('Erro ao adicionar banco');
    }
  };

  const updateBank = async (id: string, updates: Partial<Bank>) => {
    try {
      const { error } = await supabase
        .from('banks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Banco atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar banco:', error);
      toast.error('Erro ao atualizar banco');
    }
  };

  const deleteBank = async (id: string) => {
    try {
      const { error } = await supabase.from('banks').delete().eq('id', id);

      if (error) throw error;
      toast.success('Banco removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover banco:', error);
      toast.error('Erro ao remover banco');
    }
  };

  const calculateBankBalance = (bank: Bank, transactions: any[]) => {
    const bankTransactions = transactions.filter(t => t.bank_id === bank.id);
    const transactionsTotal = bankTransactions.reduce((acc, transaction) => {
      return transaction.type === 'income' 
        ? acc + transaction.amount 
        : acc - transaction.amount;
    }, 0);
    return bank.initial_balance + transactionsTotal;
  };

  return {
    banks,
    loading,
    addBank,
    updateBank,
    deleteBank,
    calculateBankBalance,
  };
};
