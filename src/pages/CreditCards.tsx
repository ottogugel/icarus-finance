import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard as CreditCardIcon, Plus, Trash2, Pencil } from 'lucide-react';
import { useCreditCards } from '@/hooks/useCreditCards';
import { formatCurrency } from '@/lib/finance';
import { cn } from '@/lib/utils';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

const CreditCards = () => {
  const navigate = useNavigate();
  const { cards, loading, addCard, deleteCard, updateCard, availableLimits } = useCreditCards();

  // Add card dialog
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [cardName, setCardName] = useState('');
  const [closingDay, setClosingDay] = useState('1');
  const [dueDay, setDueDay] = useState('10');
  const [cardLimit, setCardLimit] = useState('');
  const [cardColor, setCardColor] = useState('#e11d48');

  // Edit card dialog
  const [editCardOpen, setEditCardOpen] = useState(false);
  const [editCardId, setEditCardId] = useState<string | null>(null);
  const [editCardName, setEditCardName] = useState('');
  const [editCardLimit, setEditCardLimit] = useState('');
  const [editCardClosing, setEditCardClosing] = useState('1');
  const [editCardDue, setEditCardDue] = useState('10');
  const [editCardColor, setEditCardColor] = useState('#e11d48');
  const [editCardAvailable, setEditCardAvailable] = useState<number | null>(null);

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

  const handleOpenEditCard = async (card: typeof cards[0]) => {
    setEditCardId(card.id);
    setEditCardName(card.name);
    setEditCardLimit(String(card.card_limit));
    setEditCardClosing(String(card.closing_day));
    setEditCardDue(String(card.due_day));
    setEditCardColor(card.color);
    setEditCardAvailable(null);
    setEditCardOpen(true);

    // Available limit: card_limit minus expenses from PENDING (unpaid) bills only
    const { data: cardBills } = await supabase
      .from('credit_card_bills')
      .select('id')
      .eq('credit_card_id', card.id)
      .eq('status', 'pending');

    const billIds = (cardBills || []).map(b => b.id);
    let used = 0;
    if (billIds.length > 0) {
      const { data: exps } = await supabase
        .from('credit_card_expenses')
        .select('amount')
        .in('bill_id', billIds);
      used = (exps || []).reduce((s, e) => s + Number(e.amount), 0);
    }
    setEditCardAvailable(Number(card.card_limit) - used);
  };

  const handleEditCard = async () => {
    if (!editCardId || !editCardName.trim()) return;
    await updateCard(editCardId, {
      name: editCardName,
      card_limit: Number(editCardLimit) || 0,
      closing_day: Number(editCardClosing),
      due_day: Number(editCardDue),
      color: editCardColor,
    });
    setEditCardOpen(false);
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
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => navigate(`/credit-cards/${card.id}`)}
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
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); handleOpenEditCard(card); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-danger hover:text-danger"
                      onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {card.card_limit > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs text-muted-foreground">
                      Limite: {formatCurrency(card.card_limit)}
                    </p>
                    <span className="text-xs text-muted-foreground">·</span>
                    <p className={cn(
                      "text-xs font-medium",
                      (availableLimits[card.id] ?? card.card_limit) >= 0 ? "text-success" : "text-danger"
                    )}>
                      Disponível: {formatCurrency(availableLimits[card.id] ?? card.card_limit)}
                    </p>
                  </div>
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

        {/* Edit Card Dialog */}
        <Dialog open={editCardOpen} onOpenChange={setEditCardOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cartão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={editCardName} onChange={e => setEditCardName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dia de Fechamento</Label>
                  <Input type="number" min="1" max="31" value={editCardClosing} onChange={e => setEditCardClosing(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Dia de Vencimento</Label>
                  <Input type="number" min="1" max="31" value={editCardDue} onChange={e => setEditCardDue(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Limite</Label>
                <Input type="number" step="0.01" value={editCardLimit} onChange={e => setEditCardLimit(e.target.value)} />
              </div>
              {editCardAvailable !== null && (
                <div className="p-3 rounded-md bg-muted/50 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Limite disponível</span>
                  <span className={cn("font-semibold", editCardAvailable < 0 ? "text-danger" : "text-success")}>
                    {formatCurrency(editCardAvailable)}
                  </span>
                </div>
              )}
              <div className="space-y-2">
                <Label>Cor</Label>
                <Input type="color" value={editCardColor} onChange={e => setEditCardColor(e.target.value)} className="h-10 w-20" />
              </div>
              <Button className="w-full" onClick={handleEditCard}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default CreditCards;
