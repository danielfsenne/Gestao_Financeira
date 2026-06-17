export interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  deadline: string | null;
  createdAt: string;
}

export interface SavingsGoalRequest {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
}
