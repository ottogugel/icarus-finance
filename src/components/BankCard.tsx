import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Wallet } from 'lucide-react';
import { Bank } from '@/hooks/useSupabaseBanks';

interface BankCardProps {
  bank: Bank;
  currentBalance: number;
  onDelete: (id: string) => void;
}

export function BankCard({ bank, currentBalance, onDelete }: BankCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-2"
        style={{ backgroundColor: bank.color }}
      />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: bank.color }}
          >
            <Wallet className="h-5 w-5 text-white" />
          </div>
          {bank.name}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(bank.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Saldo Atual</p>
            <p className="text-2xl font-bold">{formatCurrency(currentBalance)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Saldo Inicial</p>
            <p className="text-sm">{formatCurrency(bank.initial_balance)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
