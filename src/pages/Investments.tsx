import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Wallet, PiggyBank, BarChart3 } from 'lucide-react';

const Investments = () => {
  const investmentTypes = [
    {
      title: "Renda Fixa",
      description: "CDB, Tesouro Direto, LCI/LCA",
      icon: Wallet,
      color: "text-blue-500",
    },
    {
      title: "Renda Variável",
      description: "Ações, FIIs, ETFs",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Previdência",
      description: "PGBL, VGBL",
      icon: PiggyBank,
      color: "text-purple-500",
    },
    {
      title: "Fundos",
      description: "Fundos de investimento",
      icon: BarChart3,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Investimentos</h1>
          <p className="text-muted-foreground">Acompanhe sua carteira de investimentos</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {investmentTypes.map((type) => (
            <Card key={type.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-3 ${type.color}`}>
                  <type.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{type.title}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 0,00</div>
                <p className="text-sm text-muted-foreground mt-1">Nenhum investimento</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resumo da Carteira</CardTitle>
            <CardDescription>Visão geral dos seus investimentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum investimento cadastrado</p>
              <p className="text-sm mt-2">
                Comece a registrar seus investimentos para acompanhar seu patrimônio
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Investments;
