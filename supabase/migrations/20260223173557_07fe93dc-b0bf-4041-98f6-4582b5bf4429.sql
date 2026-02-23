
-- Tabela de cartões de crédito
CREATE TABLE public.credit_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  closing_day INTEGER NOT NULL DEFAULT 1,
  due_day INTEGER NOT NULL DEFAULT 10,
  card_limit NUMERIC NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#e11d48',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de faturas
CREATE TABLE public.credit_card_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_card_id UUID NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  reference_month DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de despesas da fatura
CREATE TABLE public.credit_card_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID NOT NULL REFERENCES public.credit_card_bills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para credit_cards
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own credit cards" ON public.credit_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own credit cards" ON public.credit_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own credit cards" ON public.credit_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own credit cards" ON public.credit_cards FOR DELETE USING (auth.uid() = user_id);

-- RLS para credit_card_bills
ALTER TABLE public.credit_card_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bills" ON public.credit_card_bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bills" ON public.credit_card_bills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bills" ON public.credit_card_bills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bills" ON public.credit_card_bills FOR DELETE USING (auth.uid() = user_id);

-- RLS para credit_card_expenses
ALTER TABLE public.credit_card_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own expenses" ON public.credit_card_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own expenses" ON public.credit_card_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.credit_card_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.credit_card_expenses FOR DELETE USING (auth.uid() = user_id);

-- Trigger updated_at para credit_cards
CREATE TRIGGER handle_credit_cards_updated_at
  BEFORE UPDATE ON public.credit_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Unique constraint para evitar faturas duplicadas
ALTER TABLE public.credit_card_bills ADD CONSTRAINT unique_bill_per_month UNIQUE (credit_card_id, reference_month);

-- Realtime
ALTER TABLE public.credit_cards REPLICA IDENTITY FULL;
ALTER TABLE public.credit_card_bills REPLICA IDENTITY FULL;
ALTER TABLE public.credit_card_expenses REPLICA IDENTITY FULL;
