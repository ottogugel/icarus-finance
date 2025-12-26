import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, CalendarIcon, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/finance';
import { Goal, GoalDeposit, useGoalDeposits } from '@/hooks/useSupabaseGoals';

interface GoalDetailsDialogProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalDetailsDialog({ goal, open, onOpenChange }: GoalDetailsDialogProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  
  const { deposits, addDeposit, deleteDeposit, loading } = useGoalDeposits(goal?.id || null);

  if (!goal) return null;

  const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const isCompleted = goal.status === 'completed';

  const handleAddDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && Number(amount) > 0) {
      await addDeposit(Number(amount), description.trim() || undefined, date);
      setAmount('');
      setDescription('');
      setDate(new Date());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCompleted && <Trophy className="h-5 w-5 text-success" />}
            {goal.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {goal.description && (
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className={cn("font-semibold", isCompleted ? "text-success" : "")}>
                {percentage.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={percentage} 
              className={cn("h-3", isCompleted && "[&>div]:bg-success")}
            />
            <div className="flex justify-between text-sm">
              <span>{formatCurrency(goal.current_amount)}</span>
              <span className="text-muted-foreground">de {formatCurrency(goal.target_amount)}</span>
            </div>
          </div>

          {isCompleted && goal.completed_at && (
            <div className="bg-success/10 border border-success/30 rounded-lg p-3 text-center">
              <Trophy className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="font-semibold text-success">Meta concluída!</p>
              <p className="text-sm text-muted-foreground">
                Concluída em {format(new Date(goal.completed_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          )}

          {!isCompleted && (
            <>
              <Separator />
              <form onSubmit={handleAddDeposit} className="space-y-3">
                <h4 className="font-medium">Adicionar Depósito</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="deposit-amount" className="text-xs">Valor (R$)</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100.00"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(date, "dd/MM/yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => d && setDate(d)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="deposit-description" className="text-xs">Descrição (opcional)</Label>
                  <Input
                    id="deposit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Primeira parcela"
                  />
                </div>
                <Button type="submit" size="sm" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Depósito
                </Button>
              </form>
            </>
          )}

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Histórico de Depósitos</h4>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : deposits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum depósito registrado
              </p>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {deposits.map((deposit) => (
                    <DepositItem
                      key={deposit.id}
                      deposit={deposit}
                      onDelete={deleteDeposit}
                      isCompleted={isCompleted}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DepositItemProps {
  deposit: GoalDeposit;
  onDelete: (id: string) => void;
  isCompleted: boolean;
}

function DepositItem({ deposit, onDelete, isCompleted }: DepositItemProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-success">
            +{formatCurrency(deposit.amount)}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(deposit.date), "dd/MM/yyyy")}
          </span>
        </div>
        {deposit.description && (
          <p className="text-xs text-muted-foreground">{deposit.description}</p>
        )}
      </div>
      {!isCompleted && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(deposit.id)}
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
