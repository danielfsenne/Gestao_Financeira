export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  categoryName: string | null;
}

export interface TransactionRequest {
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  categoryId: number | null;
}

export interface Category {
  id: number;
  name: string;
}
