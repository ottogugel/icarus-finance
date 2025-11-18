import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { TransactionType } from '@/lib/finance';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<TransactionType>('expense');
  const [newIcon, setNewIcon] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) {
      toast.error('Digite um nome para a categoria');
      return;
    }
    
    addCategory(newName, newType, newIcon);
    setNewName('');
    setNewType('expense');
    setNewIcon('');
    setIsAddOpen(false);
    toast.success('Categoria adicionada com sucesso!');
  };

  const handleEdit = () => {
    if (!newName.trim()) {
      toast.error('Digite um nome para a categoria');
      return;
    }
    
    updateCategory(editingCategory.id, newName, newIcon);
    setEditingCategory(null);
    setNewName('');
    setNewIcon('');
    setIsEditOpen(false);
    toast.success('Categoria atualizada com sucesso!');
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Deseja realmente excluir a categoria "${name}"?`)) {
      deleteCategory(id);
      toast.success('Categoria excluída com sucesso!');
    }
  };

  const openEditDialog = (category: any) => {
    setEditingCategory(category);
    setNewName(category.name);
    setNewIcon(category.icon || '');
    setIsEditOpen(true);
  };

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas categorias de receitas e despesas
          </p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Categoria</DialogTitle>
              <DialogDescription>
                Crie uma nova categoria para organizar suas transações
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Ex: Aluguel"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={newType} onValueChange={(value) => setNewType(value as TransactionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon">Ícone (opcional)</Label>
                <Input
                  id="icon"
                  placeholder="Ex: 🏠"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  maxLength={2}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAdd}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Receitas */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-success" />
            <h2 className="text-xl font-semibold text-foreground">Receitas</h2>
            <span className="text-sm text-muted-foreground">({incomeCategories.length})</span>
          </div>
          
          <div className="space-y-2">
            {incomeCategories.map((category) => (
              <Card key={category.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {category.icon && <span className="text-2xl">{category.icon}</span>}
                    <span className="font-medium text-foreground">{category.name}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id, category.name)}
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {incomeCategories.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma categoria de receita cadastrada
              </p>
            )}
          </div>
        </div>

        {/* Despesas */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-danger" />
            <h2 className="text-xl font-semibold text-foreground">Despesas</h2>
            <span className="text-sm text-muted-foreground">({expenseCategories.length})</span>
          </div>
          
          <div className="space-y-2">
            {expenseCategories.map((category) => (
              <Card key={category.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {category.icon && <span className="text-2xl">{category.icon}</span>}
                    <span className="font-medium text-foreground">{category.name}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id, category.name)}
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {expenseCategories.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma categoria de despesa cadastrada
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>
              Atualize as informações da categoria
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-icon">Ícone (opcional)</Label>
              <Input
                id="edit-icon"
                placeholder="Ex: 🏠"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                maxLength={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
