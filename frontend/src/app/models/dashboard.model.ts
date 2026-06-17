export interface DashboardData {
  income: number;
  expense: number;
  balance: number;
  expensesByCategory: Record<string, number>;
}
