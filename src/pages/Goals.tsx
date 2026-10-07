import { useSupabaseGoals } from '@/hooks/useSupabaseGoals';
import { GoalsList } from '@/components/GoalsList';
import { Target } from 'lucide-react';

export default function Goals() {
  const { goals, addGoal, deleteGoal, loading } = useSupabaseGoals();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Carregando metas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-5 sm:py-8">
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:h-12 sm:w-12 sm:rounded-xl">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Metas Financeiras</h1>
            <p className="text-muted-foreground">Defina objetivos e acompanhe seu progresso</p>
          </div>
        </div>

        <GoalsList 
          goals={goals}
          onAddGoal={addGoal}
          onDeleteGoal={deleteGoal}
        />
      </div>
    </div>
  );
}
