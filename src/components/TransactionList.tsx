import { Transaction, formatCurrency, categoryLabels } from '@/lib/finance';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCategories } from '@/hooks/useCategories';
import { useMemo } from 'react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const { categories } = useCategories();

  const categoryNameMap = useMemo(() => {
    const map: Record<string, string> = { ...categoryLabels };
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Nenhuma transação encontrada</p>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione sua primeira transação para começar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell className="font-medium">{transaction.description}</TableCell>
                <TableCell>{categoryNameMap[transaction.category] || 'Sem categoria'}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
                      transaction.type === 'income'
                        ? 'bg-success/10 text-success'
                        : 'bg-danger/10 text-danger'
                    )}
                  >
                    {transaction.type === 'income' ? (
                      <><TrendingUp className="h-3 w-3" /> Receita</>
                    ) : (
                      <><TrendingDown className="h-3 w-3" /> Despesa</>
                    )}
                  </span>
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-semibold whitespace-nowrap',
                    transaction.type === 'income' ? 'text-success' : 'text-danger'
                  )}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transaction.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
