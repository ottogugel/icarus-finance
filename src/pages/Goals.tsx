import { useSupabaseGoals } from '@/hooks/useSupabaseGoals';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';
import { GoalsList } from '@/components/GoalsList';
import { Target } from 'lucide-react';

export default function Goals() {
  const { goals, addGoal, deleteGoal, loading: goalsLoading } = useSupabaseGoals();
  const { transactions, loading: transactionsLoading } = useSupabaseTransactions();

  if (goalsLoading || transactionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Carregando metas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Metas de Gastos</h1>
            <p className="text-muted-foreground">Defina e acompanhe suas metas por categoria</p>
          </div>
        </div>

        <GoalsList 
          goals={goals}
          transactions={transactions}
          onAddGoal={addGoal}
          onDeleteGoal={deleteGoal}
        />
      </div>
    </div>
  );
}
