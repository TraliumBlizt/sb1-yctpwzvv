export interface User {
  id: string;
  username: string;
  phone: string;
  firstName: string;
  lastName: string;
  balance: number;
  isVip: boolean;
  avatar?: string;
  country?: string;
  currency?: string;
  currencySymbol?: string;
  referralCode?: string;
  vipLevel?: number;
  vipVerificationId?: string | null;
}

export interface Transaction {
  id: string;
  user: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  amount: number;
  commission: number;
  status: 'in-progress' | 'completed' | 'frozen';
  timestamp: Date;
  image?: string;
}

export interface Stats {
  yesterday: number;
  accumulated: number;
  today: number;
}