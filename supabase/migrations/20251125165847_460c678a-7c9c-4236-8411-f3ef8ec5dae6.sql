-- Enable realtime for transactions table
ALTER TABLE public.transactions REPLICA IDENTITY FULL;

-- Enable realtime for banks table  
ALTER TABLE public.banks REPLICA IDENTITY FULL;

-- Enable realtime for goals table
ALTER TABLE public.goals REPLICA IDENTITY FULL;