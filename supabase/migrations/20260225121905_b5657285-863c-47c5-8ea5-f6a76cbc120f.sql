
ALTER TABLE public.credit_card_expenses
  ADD COLUMN installments integer NOT NULL DEFAULT 1,
  ADD COLUMN current_installment integer NOT NULL DEFAULT 1;
