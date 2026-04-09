import { useMemo } from 'react';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';
import { StatsCard } from '@/components/StatsCard';
import { CategoryChart } from '@/components/CategoryChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/finance';
import { Wallet, TrendingUp, TrendingDown, Receipt, BarChart3, Target } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';

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
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;
    const expenseCount = currentMonthTransactions.filter((t) => t.type === 'expense').length;
    const avgExpense = expenseCount > 0 ? expenses / expenseCount : 0;
    const totalTransactions = currentMonthTransactions.length;

    return { income, expenses, balance, avgExpense, totalTransactions, expenseCount };
  }, [currentMonthTransactions]);

  // Daily spending data for the current month
  const dailySpendingData = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyMap: Record<number, { income: number; expense: number }> = {};

    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap[d] = { income: 0, expense: 0 };
    }

    currentMonthTransactions.forEach((t) => {
      const day = t.date.getDate();
      if (t.type === 'expense') dailyMap[day].expense += t.amount;
      else dailyMap[day].income += t.amount;
    });

    return Object.entries(dailyMap).map(([day, vals]) => ({
      day: `${day}`,
      Despesas: vals.expense,
      Receitas: vals.income,
    }));
  }, [currentMonthTransactions]);

  // Last 6 months evolution
  const monthlyEvolutionData = useMemo(() => {
    const now = new Date();
    const data = [];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthTransactions = transactions.filter(
        (t) => t.date.getMonth() === month && t.date.getFullYear() === year
      );

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        month: `${monthNames[month]}`,
        Receitas: income,
        Despesas: expenses,
        Saldo: income - expenses,
      });
    }

    return data;
  }, [transactions]);

  const currencyFormatter = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(value);

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

        {/* Main Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
          <StatsCard title="Saldo" value={currentMonthStats.balance} icon={Wallet} variant="default" />
          <StatsCard title="Receitas" value={currentMonthStats.income} icon={TrendingUp} variant="success" />
          <StatsCard title="Despesas" value={currentMonthStats.expenses} icon={TrendingDown} variant="danger" />
          <StatsCard title="Gasto Médio" value={currentMonthStats.avgExpense} icon={BarChart3} variant="danger" />
          <Card className="overflow-hidden transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Transações</p>
                  <p className="text-2xl font-bold tracking-tight">{currentMonthStats.totalTransactions}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Receipt className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">% Economia</p>
                  <p className="text-2xl font-bold tracking-tight">
                    {currentMonthStats.income > 0
                      ? `${((1 - currentMonthStats.expenses / currentMonthStats.income) * 100).toFixed(0)}%`
                      : '0%'}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Target className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Monthly Evolution */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal (6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyEvolutionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis tickFormatter={currencyFormatter} className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="Receitas" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Despesas" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Spending */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos Diários do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailySpendingData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" interval="preserveStartEnd" />
                  <YAxis tickFormatter={currencyFormatter} className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Line type="monotone" dataKey="Despesas" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Receitas" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Chart */}
        <div>
          <CategoryChart transactions={currentMonthTransactions} />
        </div>
      </div>
    </div>
  );
};

export default Index;
