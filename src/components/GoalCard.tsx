import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, Trophy } from 'lucide-react';
import { formatCurrency } from '@/lib/finance';
import { Goal } from '@/hooks/useSupabaseGoals';

interface GoalCardProps {
  goal: Goal;
  onDelete: (id: string) => void;
  onViewDetails: (goal: Goal) => void;
}

export function GoalCard({ goal, onDelete, onViewDetails }: GoalCardProps) {
  const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const isCompleted = goal.status === 'completed';
  const remaining = goal.target_amount - goal.current_amount;

  return (
    <Card className={isCompleted ? 'border-success/50 bg-success/5' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {isCompleted && <Trophy className="h-5 w-5 text-success" />}
            <CardTitle className="text-lg">{goal.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewDetails(goal)}
              className="h-8 w-8"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(goal.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {goal.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className={isCompleted ? 'text-success font-semibold' : 'font-medium'}>
            {percentage.toFixed(0)}%
          </span>
        </div>
        
        <Progress 
          value={percentage} 
          className={isCompleted ? '[&>div]:bg-success' : ''}
        />
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Depositado</span>
          <span className="font-medium">{formatCurrency(goal.current_amount)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Objetivo</span>
          <span className="font-medium">{formatCurrency(goal.target_amount)}</span>
        </div>
        
        {isCompleted ? (
          <div className="text-sm text-success font-semibold flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            Meta concluída!
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Faltam {formatCurrency(remaining)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
