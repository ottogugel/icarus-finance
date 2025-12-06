import { useState } from 'react';
import { useSupabaseBanks, Bank } from '@/hooks/useSupabaseBanks';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';
import { BankCard } from '@/components/BankCard';
import { AddBankDialog } from '@/components/AddBankDialog';
import { EditBankDialog } from '@/components/EditBankDialog';
import { Building2 } from 'lucide-react';

export default function Banks() {
  const { banks, addBank, updateBank, deleteBank, calculateBankBalance, loading: banksLoading } = useSupabaseBanks();
  const { transactions, loading: transactionsLoading } = useSupabaseTransactions();
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Bancos & Contas</h1>
              <p className="text-muted-foreground">Gerencie suas contas bancárias</p>
            </div>
          </div>
          <AddBankDialog onAdd={addBank} />
        </div>

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
                currentBalance={calculateBankBalance(bank, transactions)}
                onDelete={deleteBank}
                onEdit={handleEdit}
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
