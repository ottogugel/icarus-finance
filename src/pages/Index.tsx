import { useTransactions } from '@/hooks/useTransactions';
import { StatsCard } from '@/components/StatsCard';
import { TransactionList } from '@/components/TransactionList';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { CategoryChart } from '@/components/CategoryChart';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const Index = () => {
  const { transactions, addTransaction, deleteTransaction, stats } = useTransactions();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Controle Financeiro</h1>
                <p className="text-sm text-muted-foreground">Gerencie suas finanças</p>
              </div>
            </div>
            <AddTransactionDialog onAdd={addTransaction} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <StatsCard title="Saldo Total" value={stats.balance} icon={Wallet} variant="default" />
          <StatsCard title="Receitas" value={stats.income} icon={TrendingUp} variant="success" />
          <StatsCard title="Despesas" value={stats.expenses} icon={TrendingDown} variant="danger" />
        </div>

        {/* Chart and Transactions */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Chart */}
          <div className="lg:col-span-1">
            <CategoryChart transactions={transactions} />
          </div>

          {/* Transactions List */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">Transações Recentes</h2>
              <p className="text-muted-foreground">Histórico de todas as suas transações</p>
            </div>
            <TransactionList transactions={transactions} onDelete={deleteTransaction} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
