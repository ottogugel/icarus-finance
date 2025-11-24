-- Criar tabela de bancos/contas
CREATE TABLE public.banks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  initial_balance NUMERIC NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para bancos
CREATE POLICY "Users can view own banks" 
ON public.banks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own banks" 
ON public.banks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own banks" 
ON public.banks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own banks" 
ON public.banks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Adicionar coluna bank_id na tabela transactions
ALTER TABLE public.transactions 
ADD COLUMN bank_id UUID REFERENCES public.banks(id) ON DELETE SET NULL;

-- Criar índice para melhor performance
CREATE INDEX idx_transactions_bank_id ON public.transactions(bank_id);
CREATE INDEX idx_banks_user_id ON public.banks(user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_banks_updated_at
BEFORE UPDATE ON public.banks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Habilitar realtime para bancos
ALTER TABLE public.banks REPLICA IDENTITY FULL;