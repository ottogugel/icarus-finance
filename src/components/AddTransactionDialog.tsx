import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionType, Category } from '@/lib/finance';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Bank } from '@/hooks/useSupabaseBanks';
import { useCategories } from '@/hooks/useCategories';

interface AddTransactionDialogProps {
  onAdd: (description: string, amount: number, type: TransactionType, category: Category, date: Date, bankId?: string) => void;
  banks?: Bank[];
}

export function AddTransactionDialog({ onAdd, banks = [] }: AddTransactionDialogProps) {
  const { getCategoriesByType } = useCategories();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bankId, setBankId] = useState<string>('');
  
  const categories = getCategoriesByType(type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error('Adicione uma descrição');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Valor inválido');
      return;
    }

    if (!bankId) {
      toast.error('Selecione um banco');
      return;
    }

    if (!category) {
      toast.error('Selecione uma categoria');
      return;
    }

    onAdd(description, parsedAmount, type, category as Category, new Date(date), bankId);
    
    // Reset form
    setDescription('');
    setAmount('');
    setType('expense');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setBankId('');
    setOpen(false);
    
    toast.success('Transação adicionada!');
  };

  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Supermercado"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(value) => setType(value as TransactionType)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {banks.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="bank">Banco</Label>
              <Select value={bankId} onValueChange={setBankId}>
                <SelectTrigger id="bank">
                  <SelectValue placeholder="Selecione um banco" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md">
              Você precisa criar um banco primeiro para adicionar transações.
            </div>
          )}

          <Button type="submit" className="w-full" disabled={banks.length === 0}>
            Adicionar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
