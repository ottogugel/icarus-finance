import { useState, useMemo } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditCard as CreditCardIcon, Plus, ChevronLeft, ChevronRight, Trash2, CheckCircle, Clock, CalendarIcon, Pencil } from 'lucide-react';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useCategories } from '@/hooks/useCategories';
import { formatCurrency } from '@/lib/finance';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const CreditCards = () => {
  const {
    cards, bills, expenses, loading,
    addCard, deleteCard, fetchBills, fetchExpenses,
    getOrCreateBill, addExpense, updateExpense, deleteExpense, toggleBillStatus,
    setSelectedCardId,
  } = useCreditCards();
  const { categories } = useCategories();

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

  // Add card dialog
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [cardName, setCardName] = useState('');
  const [closingDay, setClosingDay] = useState('1');
  const [dueDay, setDueDay] = useState('10');
  const [cardLimit, setCardLimit] = useState('');
  const [cardColor, setCardColor] = useState('#e11d48');

  // Add expense dialog
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('');
  const [expDate, setExpDate] = useState<Date>(new Date());
  const [expInstallments, setExpInstallments] = useState('1');

  // Edit expense dialog
  const [editExpenseOpen, setEditExpenseOpen] = useState(false);
  const [editExpId, setEditExpId] = useState<string | null>(null);
  const [editExpDesc, setEditExpDesc] = useState('');
  const [editExpAmount, setEditExpAmount] = useState('');
  const [editExpCategory, setEditExpCategory] = useState('');
  const [editExpDate, setEditExpDate] = useState<Date>(new Date());

  const expenseCategories = useMemo(() => 
    categories.filter(c => c.type === 'expense'), [categories]
  );

  const currentBill = useMemo(() => {
    return bills.find(b => {
      const [year, month] = b.reference_month.split('-').map(Number);
      return year === selectedMonth.getFullYear() && month === selectedMonth.getMonth() + 1;
    });
  }, [bills, selectedMonth]);

  const totalExpenses = useMemo(() => 
    expenses.reduce((sum, e) => sum + Number(e.amount), 0), [expenses]
  );

  const handleSelectCard = async (cardId: string) => {
    setSelectedCard(cardId);
    setSelectedCardId(cardId);
    setSelectedBillId(null);
    await fetchBills(cardId);
  };

  const handleMonthChange = async (direction: 'prev' | 'next') => {
    const newMonth = direction === 'prev' ? subMonths(selectedMonth, 1) : addMonths(selectedMonth, 1);
    setSelectedMonth(newMonth);
    // Re-fetch bills to find the one for this month
    if (selectedCard) {
      await fetchBills(selectedCard);
    }
  };

  // When bills change, auto-select current month bill
  const activeBill = currentBill;

  const handleViewBill = async () => {
    if (!selectedCard) return;
    const billId = await getOrCreateBill(selectedCard, selectedMonth);
    if (billId) {
      setSelectedBillId(billId);
      await fetchBills(selectedCard);
      await fetchExpenses(billId);
    }
  };

  const handleAddCard = async () => {
    if (!cardName.trim()) return;
    await addCard(cardName, Number(closingDay), Number(dueDay), Number(cardLimit) || 0, cardColor);
    setAddCardOpen(false);
    setCardName('');
    setClosingDay('1');
    setDueDay('10');
    setCardLimit('');
    setCardColor('#e11d48');
  };

  const handleAddExpense = async () => {
    if (!expDesc.trim() || !expAmount || !selectedBillId) return;
    await addExpense(selectedBillId, expDesc, Number(expAmount), expCategory || 'other-expense', expDate, Number(expInstallments) || 1);
    setAddExpenseOpen(false);
    setExpDesc('');
    setExpAmount('');
    setExpCategory('');
    setExpDate(new Date());
    setExpInstallments('1');
  };

  const activeCard = cards.find(c => c.id === selectedCard);

  const handleOpenEditExpense = (exp: typeof expenses[0]) => {
    setEditExpId(exp.id);
    setEditExpDesc(exp.description);
    setEditExpAmount(String(exp.amount));
    setEditExpCategory(exp.category);
    setEditExpDate(new Date(exp.date));
    setEditExpenseOpen(true);
  };

  const handleEditExpense = async () => {
    if (!editExpId || !editExpDesc.trim() || !editExpAmount || !selectedBillId) return;
    await updateExpense(editExpId, selectedBillId, {
      description: editExpDesc,
      amount: Number(editExpAmount),
      category: editExpCategory || 'other-expense',
      date: editExpDate.toISOString().split('T')[0],
    });
    setEditExpenseOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Cartões de Crédito</h1>
            <p className="text-muted-foreground">Gerencie suas faturas de cartão</p>
          </div>

          <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Novo Cartão</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Cartão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input placeholder="Ex: Santander" value={cardName} onChange={e => setCardName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dia de Fechamento</Label>
                    <Input type="number" min="1" max="31" value={closingDay} onChange={e => setClosingDay(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Dia de Vencimento</Label>
                    <Input type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Limite</Label>
                  <Input type="number" placeholder="0.00" value={cardLimit} onChange={e => setCardLimit(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <Input type="color" value={cardColor} onChange={e => setCardColor(e.target.value)} className="h-10 w-20" />
                </div>
                <Button className="w-full" onClick={handleAddCard}>Adicionar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards List */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {cards.map(card => (
            <Card
              key={card.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedCard === card.id && "ring-2 ring-primary"
              )}
              onClick={() => handleSelectCard(card.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: card.color }}>
                      <CreditCardIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{card.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Fecha dia {card.closing_day} · Vence dia {card.due_day}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-danger hover:text-danger"
                    onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {card.card_limit > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Limite: {formatCurrency(card.card_limit)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {cards.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="pt-6 text-center text-muted-foreground">
                <CreditCardIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum cartão cadastrado</p>
                <p className="text-sm">Adicione seu primeiro cartão de crédito</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Bill Section */}
        {selectedCard && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCardIcon className="h-5 w-5" />
                  Fatura - {activeCard?.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleMonthChange('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[140px] text-center capitalize">
                    {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                  </span>
                  <Button variant="outline" size="icon" onClick={() => handleMonthChange('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Auto-load or create bill */}
              {!selectedBillId && (
                <div className="text-center py-6">
                  <Button onClick={handleViewBill}>
                    Ver / Criar Fatura de {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                  </Button>
                </div>
              )}

              {selectedBillId && activeBill && (
                <div className="space-y-4">
                  {/* Bill Summary */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm text-muted-foreground">Total da Fatura</p>
                      <p className="text-2xl font-bold text-danger">{formatCurrency(totalExpenses)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Vencimento</p>
                      <p className="font-medium">{format(new Date(activeBill.due_date), 'dd/MM/yyyy')}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Badge variant={activeBill.status === 'paid' ? 'default' : 'destructive'} className={activeBill.status === 'paid' ? 'bg-success text-success-foreground' : ''}>
                        {activeBill.status === 'paid' ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Paga</>
                        ) : (
                          <><Clock className="h-3 w-3 mr-1" /> Pendente</>
                        )}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => toggleBillStatus(activeBill.id)}>
                        {activeBill.status === 'paid' ? 'Marcar pendente' : 'Marcar como paga'}
                      </Button>
                    </div>
                  </div>

                  {/* Add Expense */}
                  <div className="flex justify-end">
                    <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Adicionar Despesa</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nova Despesa na Fatura</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Input placeholder="Ex: Supermercado" value={expDesc} onChange={e => setExpDesc(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Valor</Label>
                            <Input type="number" step="0.01" placeholder="0.00" value={expAmount} onChange={e => setExpAmount(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select value={expCategory} onValueChange={setExpCategory}>
                              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                {expenseCategories.map(c => (
                                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Data</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {format(expDate, 'dd/MM/yyyy', { locale: ptBR })}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={expDate}
                                  onSelect={(d) => d && setExpDate(d)}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                          </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label>Parcelas</Label>
                            <Input type="number" min="1" max="48" value={expInstallments} onChange={e => setExpInstallments(e.target.value)} placeholder="1" />
                          </div>
                          {Number(expInstallments) > 1 && Number(expAmount) > 0 && (
                            <p className="text-sm text-muted-foreground">
                              {Number(expInstallments)}x de {formatCurrency(Math.round((Number(expAmount) / Number(expInstallments)) * 100) / 100)}
                            </p>
                          )}
                          <Button className="w-full" onClick={handleAddExpense}>Adicionar</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Expenses Table */}
                  {expenses.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Parcela</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenses.map(exp => (
                          <TableRow key={exp.id}>
                            <TableCell>{format(new Date(exp.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{exp.description}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{exp.category}</Badge>
                            </TableCell>
                            <TableCell>
                              {exp.installments > 1 ? (
                                <Badge variant="outline">{exp.current_installment}/{exp.installments}</Badge>
                              ) : null}
                            </TableCell>
                            <TableCell className="text-right font-medium text-danger">
                              {formatCurrency(Number(exp.amount))}
                            </TableCell>
                            <TableCell className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => handleOpenEditExpense(exp)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-danger hover:text-danger"
                                onClick={() => deleteExpense(exp.id, selectedBillId!)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nenhuma despesa nesta fatura</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Edit Expense Dialog */}
        <Dialog open={editExpenseOpen} onOpenChange={setEditExpenseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Despesa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={editExpDesc} onChange={e => setEditExpDesc(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input type="number" step="0.01" value={editExpAmount} onChange={e => setEditExpAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={editExpCategory} onValueChange={setEditExpCategory}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(editExpDate, 'dd/MM/yyyy', { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editExpDate}
                      onSelect={(d) => d && setEditExpDate(d)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button className="w-full" onClick={handleEditExpense}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CreditCards;
