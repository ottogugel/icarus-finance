import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bank } from '@/hooks/useSupabaseBanks';

const BANK_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
];

interface EditBankDialogProps {
  bank: Bank | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Bank>) => void;
}

export function EditBankDialog({ bank, open, onOpenChange, onUpdate }: EditBankDialogProps) {
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState(BANK_COLORS[0]);

  useEffect(() => {
    if (bank) {
      setName(bank.name);
      setInitialBalance(bank.initial_balance.toString());
      setSelectedColor(bank.color);
    }
  }, [bank]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bank && name.trim()) {
      onUpdate(bank.id, {
        name,
        initial_balance: parseFloat(initialBalance) || 0,
        color: selectedColor,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Banco</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-bank-name">Nome do Banco</Label>
            <Input
              id="edit-bank-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Nubank, Itaú, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-initial-balance">Saldo Inicial</Label>
            <Input
              id="edit-initial-balance"
              type="number"
              step="0.01"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Cor do Banco</Label>
            <div className="flex gap-2 flex-wrap">
              {BANK_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full transition-transform ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Salvar Alterações
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
