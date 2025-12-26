import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency, currencies, CurrencyCode } from '@/hooks/useCurrency';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings as SettingsIcon, User, Palette, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Perfil atualizado com sucesso!');
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value as CurrencyCode);
    toast.success(`Moeda alterada para ${currencies[value as CurrencyCode].name}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">Gerencie suas preferências e informações</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Palette className="h-4 w-4" />
              Preferências
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <Info className="h-4 w-4" />
              Sobre
            </TabsTrigger>
          </TabsList>

          {/* Perfil Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      O email não pode ser alterado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                    />
                  </div>
                  <Button type="submit">Salvar Alterações</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>
                  Gerencie sua senha e segurança da conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full text-destructive">
                  Excluir Conta
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferências Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>
                  Personalize a aparência do aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Ative o tema escuro para reduzir o brilho
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Configure como você recebe notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações sobre suas finanças
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-updates">Atualizações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba resumos semanais por email
                    </p>
                  </div>
                  <Switch
                    id="email-updates"
                    checked={emailUpdates}
                    onCheckedChange={setEmailUpdates}
                  />
                </div>
              </CardContent>
            </Card> */}

            <Card>
              <CardHeader>
                <CardTitle>Formato de Dados</CardTitle>
                <CardDescription>
                  Configure como os dados são exibidos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda</Label>
                  <Select value={currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Selecione a moeda" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(currencies).map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          <span className="flex items-center gap-2">
                            <span className="font-medium">{curr.symbol}</span>
                            <span>{curr.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Todos os valores serão exibidos na moeda selecionada
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-format">Formato de Data</Label>
                  <Input
                    id="date-format"
                    defaultValue="DD/MM/YYYY"
                    disabled
                    className="bg-muted"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sobre Tab */}
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Finance Tracker</CardTitle>
                <CardDescription>
                  Informações sobre o aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Versão</Label>
                  <p className="text-sm text-muted-foreground">1.0.3</p>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <p className="text-sm text-muted-foreground">
                    Finance Tracker é um aplicativo completo para gerenciamento de finanças pessoais.
                    Acompanhe suas receitas, despesas, metas financeiras e investimentos em um só lugar.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Recursos</Label>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Dashboard com visão geral das finanças</li>
                    <li>Registro de transações de receitas e despesas</li>
                    <li>Metas financeiras por categoria</li>
                    <li>Gráficos e relatórios</li>
                    <li>Categorias personalizáveis</li>
                    <li>Controle de investimentos</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle>Suporte</CardTitle>
                <CardDescription>
                  Precisa de ajuda?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Central de Ajuda
                </Button>
                <Button variant="outline" className="w-full">
                  Reportar Problema
                </Button>
                <Button variant="outline" className="w-full">
                  Termos de Uso
                </Button>
              </CardContent>
            </Card> */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
