import { useMemo } from 'react';
import { Transaction } from '@/lib/finance';
import { Goal } from '@/hooks/useGoals';
import { GoalCard } from '@/components/GoalCard';
import { AddGoalDialog } from '@/components/AddGoalDialog';

interface GoalsListProps {
  goals: Goal[];
  transactions: Transaction[];
  onAddGoal: (category: any, limit: number, month: string) => void;
  onDeleteGoal: (id: string) => void;
}

export function GoalsList({ goals, transactions, onAddGoal, onDeleteGoal }: GoalsListProps) {
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const currentGoals = useMemo(() => {
    return goals.filter((g) => g.month === currentMonth);
  }, [goals, currentMonth]);

  const spentByCategory = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth();

    return transactions
      .filter((t) => {
        const txDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          txDate.getFullYear() === currentYear &&
          txDate.getMonth() === currentMonthNum
        );
      })
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  }, [transactions]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Metas de Gastos</h2>
          <p className="text-muted-foreground">Acompanhe seus limites mensais</p>
        </div>
        <AddGoalDialog onAdd={onAddGoal} />
      </div>

      {currentGoals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma meta definida para este mês. Adicione uma meta para começar!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              spent={spentByCategory[goal.category] || 0}
              onDelete={onDeleteGoal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
