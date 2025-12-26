-- Drop existing goals table and recreate with new structure
DROP TABLE IF EXISTS public.goals CASCADE;

-- Create new goals table for savings goals
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Create table for goal deposits/contributions
CREATE TABLE public.goal_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT goal_deposits_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES public.goals(id) ON DELETE CASCADE,
  CONSTRAINT goal_deposits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_deposits ENABLE ROW LEVEL SECURITY;

-- RLS policies for goals
CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for goal_deposits
CREATE POLICY "Users can view own deposits" ON public.goal_deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own deposits" ON public.goal_deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own deposits" ON public.goal_deposits FOR DELETE USING (auth.uid() = user_id);

-- Function to update goal current_amount and check completion
CREATE OR REPLACE FUNCTION public.update_goal_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total NUMERIC;
  goal_target NUMERIC;
BEGIN
  -- Calculate new total
  SELECT COALESCE(SUM(amount), 0) INTO new_total
  FROM public.goal_deposits
  WHERE goal_id = COALESCE(NEW.goal_id, OLD.goal_id);
  
  -- Get target amount
  SELECT target_amount INTO goal_target
  FROM public.goals
  WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);
  
  -- Update goal current_amount and status
  UPDATE public.goals
  SET 
    current_amount = new_total,
    status = CASE WHEN new_total >= goal_target THEN 'completed' ELSE 'active' END,
    completed_at = CASE WHEN new_total >= goal_target AND status = 'active' THEN now() ELSE completed_at END
  WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to auto-update goal amount on deposit changes
CREATE TRIGGER update_goal_on_deposit
AFTER INSERT OR UPDATE OR DELETE ON public.goal_deposits
FOR EACH ROW
EXECUTE FUNCTION public.update_goal_amount();