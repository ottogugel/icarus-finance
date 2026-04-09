import { useMemo } from 'react';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';
import { StatsCard } from '@/components/StatsCard';
import { CategoryChart } from '@/components/CategoryChart';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const Index = () => {
  const { transactions, loading: transactionsLoading } = useSupabaseTransactions();

  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter(
      (transaction) =>
        transaction.date.getMonth() === currentMonth &&
        transaction.date.getFullYear() === currentYear
    );
  }, [transactions]);

  const currentMonthStats = useMemo(() => {
    const income = currentMonthTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const expenses = currentMonthTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const balance = income - expenses;

    return { income, expenses, balance };
  }, [currentMonthTransactions]);

  if (transactionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral das suas finanças</p>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <StatsCard title="Saldo Total" value={currentMonthStats.balance} icon={Wallet} variant="default" />
          <StatsCard title="Receitas" value={currentMonthStats.income} icon={TrendingUp} variant="success" />
          <StatsCard title="Despesas" value={currentMonthStats.expenses} icon={TrendingDown} variant="danger" />
        </div>

        {/* Chart */}
        <div className="mt-8">
          <CategoryChart transactions={currentMonthTransactions} />
        </div>
      </div>
    </div>
  );
};

export default Index;

