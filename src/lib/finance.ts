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
  bank_id?: string | null;
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
  // Check localStorage for currency preference
  let currencyCode = 'BRL';
  let locale = 'pt-BR';
  
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('finance-app-currency');
    if (stored === 'USD') {
      currencyCode = 'USD';
      locale = 'en-US';
    } else if (stored === 'EUR') {
      currencyCode = 'EUR';
      locale = 'de-DE';
    }
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}

export function getMonthYearLabel(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}
