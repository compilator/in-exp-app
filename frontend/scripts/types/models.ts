export type CategoryType = 'income' | 'expense';
export type OperationType = 'income' | 'expense';

export interface Category {
  id: number;
  title: string;
}

export interface Operation {
  id: number;
  type: OperationType;
  amount: number;
  date: string;
  comment?: string;
  category_id?: number;
  category?: string | { title?: string };
}

export interface User {
  id: number;
  name: string;
  lastName: string;
  email?: string;
}

export interface OperationsFilter {
  period: string;
  dateFrom: string;
  dateTo: string;
}

export interface DeleteModalState {
  type: CategoryType | null;
  id: string | null;
  operationId: string | null;
}

export interface BalanceResponse {
  balance: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginResponse {
  tokens?: AuthTokens;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}
