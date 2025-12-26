import { useState } from 'react';
import { Goal } from '@/hooks/useSupabaseGoals';
import { GoalCard } from '@/components/GoalCard';
import { GoalDetailsDialog } from '@/components/GoalDetailsDialog';
import { AddGoalDialog } from '@/components/AddGoalDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target } from 'lucide-react';

interface GoalsListProps {
  goals: Goal[];
  onAddGoal: (name: string, targetAmount: number, description?: string) => void;
  onDeleteGoal: (id: string) => void;
}

export function GoalsList({ goals, onAddGoal, onDeleteGoal }: GoalsListProps) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  const handleViewDetails = (goal: Goal) => {
    setSelectedGoal(goal);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Suas Metas</h2>
          <p className="text-muted-foreground">Acompanhe o progresso das suas metas</p>
        </div>
        <AddGoalDialog onAdd={onAddGoal} />
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Ativas ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Concluídas ({completedGoals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {activeGoals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma meta ativa. Crie uma meta para começar!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={onDeleteGoal}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completedGoals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma meta concluída ainda. Continue focado!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={onDeleteGoal}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <GoalDetailsDialog
        goal={selectedGoal}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}
