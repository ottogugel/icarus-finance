import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CreditCard {
  id: string;
  name: string;
  closing_day: number;
  due_day: number;
  card_limit: number;
  color: string;
  created_at: string;
}

export interface CreditCardBill {
  id: string;
  credit_card_id: string;
  reference_month: string;
  due_date: string;
  status: 'pending' | 'paid';
  paid_at: string | null;
  created_at: string;
}

export interface CreditCardExpense {
  id: string;
  bill_id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
}

export function useCreditCards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [bills, setBills] = useState<CreditCardBill[]>([]);
  const [expenses, setExpenses] = useState<CreditCardExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    setCards((data || []) as CreditCard[]);
  }, [user]);

  const fetchBills = useCallback(async (cardId?: string) => {
    if (!user) return;
    let query = supabase
      .from('credit_card_bills')
      .select('*')
      .eq('user_id', user.id)
      .order('reference_month', { ascending: false });

    if (cardId) query = query.eq('credit_card_id', cardId);

    const { data, error } = await query;
    if (error) {
      console.error(error);
      return;
    }
    setBills((data || []) as CreditCardBill[]);
  }, [user]);

  const fetchExpenses = useCallback(async (billId: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('credit_card_expenses')
      .select('*')
      .eq('bill_id', billId)
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    setExpenses((data || []) as CreditCardExpense[]);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setCards([]);
      setBills([]);
      setExpenses([]);
      setLoading(false);
      return;
    }
    fetchCards().then(() => setLoading(false));
  }, [user, fetchCards]);

  const addCard = async (name: string, closingDay: number, dueDay: number, cardLimit: number, color: string) => {
    if (!user) return;
    const { error } = await supabase.from('credit_cards').insert({
      user_id: user.id,
      name,
      closing_day: closingDay,
      due_day: dueDay,
      card_limit: cardLimit,
      color,
    });
    if (error) {
      toast.error('Erro ao adicionar cartão');
      console.error(error);
      return;
    }
    toast.success('Cartão adicionado!');
    fetchCards();
  };

  const deleteCard = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('credit_cards').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      toast.error('Erro ao deletar cartão');
      console.error(error);
      return;
    }
    toast.success('Cartão deletado!');
    fetchCards();
  };

  const getOrCreateBill = async (cardId: string, referenceMonth: Date): Promise<string | null> => {
    if (!user) return null;

    const refDate = new Date(referenceMonth.getFullYear(), referenceMonth.getMonth(), 1);
    const refStr = refDate.toISOString().split('T')[0];

    // Try to find existing bill
    const { data: existing } = await supabase
      .from('credit_card_bills')
      .select('id')
      .eq('credit_card_id', cardId)
      .eq('reference_month', refStr)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) return existing.id;

    // Find card to get due_day
    const card = cards.find(c => c.id === cardId);
    const dueDay = card?.due_day || 10;
    const dueDate = new Date(refDate.getFullYear(), refDate.getMonth(), dueDay);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('credit_card_bills')
      .insert({
        credit_card_id: cardId,
        user_id: user.id,
        reference_month: refStr,
        due_date: dueDateStr,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      toast.error('Erro ao criar fatura');
      console.error(error);
      return null;
    }
    return data.id;
  };

  const addExpense = async (billId: string, description: string, amount: number, category: string, date: Date) => {
    if (!user) return;
    const { error } = await supabase.from('credit_card_expenses').insert({
      bill_id: billId,
      user_id: user.id,
      description,
      amount,
      category,
      date: date.toISOString().split('T')[0],
    });
    if (error) {
      toast.error('Erro ao adicionar despesa');
      console.error(error);
      return;
    }
    toast.success('Despesa adicionada!');
    fetchExpenses(billId);
  };

  const deleteExpense = async (id: string, billId: string) => {
    if (!user) return;
    const { error } = await supabase.from('credit_card_expenses').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      toast.error('Erro ao deletar despesa');
      console.error(error);
      return;
    }
    toast.success('Despesa deletada!');
    fetchExpenses(billId);
  };

  const toggleBillStatus = async (billId: string) => {
    if (!user) return;
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    const newStatus = bill.status === 'paid' ? 'pending' : 'paid';
    const { error } = await supabase
      .from('credit_card_bills')
      .update({
        status: newStatus,
        paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
      })
      .eq('id', billId)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Erro ao atualizar status');
      console.error(error);
      return;
    }
    toast.success(newStatus === 'paid' ? 'Fatura marcada como paga!' : 'Fatura marcada como pendente!');
    fetchBills(bill.credit_card_id);
  };

  return {
    cards,
    bills,
    expenses,
    loading,
    addCard,
    deleteCard,
    fetchBills,
    fetchExpenses,
    getOrCreateBill,
    addExpense,
    deleteExpense,
    toggleBillStatus,
  };
}
