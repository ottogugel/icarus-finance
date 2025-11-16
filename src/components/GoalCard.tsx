import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { categoryLabels, formatCurrency } from '@/lib/finance';
import { Goal } from '@/hooks/useGoals';

interface GoalCardProps {
  goal: Goal;
  spent: number;
  onDelete: (id: string) => void;
}

export function GoalCard({ goal, spent, onDelete }: GoalCardProps) {
  const percentage = Math.min((spent / goal.limit) * 100, 100);
  const isOverLimit = spent > goal.limit;
  const remaining = goal.limit - spent;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{categoryLabels[goal.category]}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(goal.id)}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Gasto</span>
          <span className={isOverLimit ? 'text-danger font-semibold' : 'font-medium'}>
            {formatCurrency(spent)}
          </span>
        </div>
        
        <Progress 
          value={percentage} 
          className={isOverLimit ? '[&>div]:bg-danger' : ''}
        />
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Limite</span>
          <span className="font-medium">{formatCurrency(goal.limit)}</span>
        </div>
        
        {!isOverLimit ? (
          <div className="text-sm text-success font-medium">
            Restam {formatCurrency(remaining)}
          </div>
        ) : (
          <div className="text-sm text-danger font-semibold">
            Limite excedido em {formatCurrency(Math.abs(remaining))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
