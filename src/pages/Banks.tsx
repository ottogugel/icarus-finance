import { useState, useMemo } from 'react';
import { useSupabaseBanks, Bank } from '@/hooks/useSupabaseBanks';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';
import { BankCard } from '@/components/BankCard';
import { AddBankDialog } from '@/components/AddBankDialog';
import { EditBankDialog } from '@/components/EditBankDialog';
import { Building2, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Banks() {
  const { banks, addBank, updateBank, deleteBank, loading: banksLoading } = useSupabaseBanks();
  const { transactions, loading: transactionsLoading } = useSupabaseTransactions();
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  // Generate last 12 months for filter options
  const periodOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'Todo o período' }];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = subMonths(now, i);
      const value = format(date, 'yyyy-MM');
      const label = format(date, 'MMMM yyyy', { locale: ptBR });
      options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    
    return options;
  }, []);

  // Filter transactions by selected period
  const filteredTransactions = useMemo(() => {
    if (selectedPeriod === 'all') return transactions;
    
    const [year, month] = selectedPeriod.split('-').map(Number);
    const periodStart = startOfMonth(new Date(year, month - 1));
    const periodEnd = endOfMonth(new Date(year, month - 1));
    
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= periodStart && transactionDate <= periodEnd;
    });
  }, [transactions, selectedPeriod]);

  // Calculate balance considering period
  const calculatePeriodBalance = (bank: Bank) => {
    const bankTransactions = filteredTransactions.filter(t => t.bank_id === bank.id);
    const transactionsTotal = bankTransactions.reduce((acc, transaction) => {
      return transaction.type === 'income' 
        ? acc + transaction.amount 
        : acc - transaction.amount;
    }, 0);
    
    // If filtering by period, just show the movement in that period
    if (selectedPeriod !== 'all') {
      return transactionsTotal;
    }
    
    // If showing all, include initial balance
    return bank.initial_balance + transactionsTotal;
  };

  const handleEdit = (bank: Bank) => {
    setEditingBank(bank);
    setEditDialogOpen(true);
  };

  if (banksLoading || transactionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Carregando bancos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Bancos & Contas</h1>
              <p className="text-muted-foreground">Gerencie suas contas bancárias</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <AddBankDialog onAdd={addBank} />
          </div>
        </div>

        {selectedPeriod !== 'all' && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            Exibindo movimentações de {periodOptions.find(p => p.value === selectedPeriod)?.label}. 
            O saldo mostra apenas as entradas e saídas deste período.
          </div>
        )}

        {banks.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum banco cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Adicione suas contas bancárias para acompanhar o saldo de cada uma
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {banks.map((bank) => (
              <BankCard
                key={bank.id}
                bank={bank}
                currentBalance={calculatePeriodBalance(bank)}
                onDelete={deleteBank}
                onEdit={handleEdit}
                showPeriodLabel={selectedPeriod !== 'all'}
              />
            ))}
          </div>
        )}
      </div>

      <EditBankDialog
        bank={editingBank}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={updateBank}
      />
    </div>
  );
}