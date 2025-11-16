export type TransactionType = 'income' | 'expense';

export type Category = 
  | 'salary' 
  | 'freelance' 
  | 'investment' 
  | 'other-income'
  | 'food' 
  | 'transport' 
  | 'housing' 
  | 'entertainment' 
  | 'health' 
  | 'education'
  | 'shopping'
  | 'bills'
  | 'other-expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: Date;
}

export const categoryLabels: Record<Category, string> = {
  salary: 'Salário',
  freelance: 'Freelance',
  investment: 'Investimento',
  'other-income': 'Outras Receitas',
  food: 'Alimentação',
  transport: 'Transporte',
  housing: 'Moradia',
  entertainment: 'Entretenimento',
  health: 'Saúde',
  education: 'Educação',
  shopping: 'Compras',
  bills: 'Contas',
  'other-expense': 'Outras Despesas',
};

export const incomeCategories: Category[] = ['salary', 'freelance', 'investment', 'other-income'];
export const expenseCategories: Category[] = ['food', 'transport', 'housing', 'entertainment', 'health', 'education', 'shopping', 'bills', 'other-expense'];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function getMonthYearLabel(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}
