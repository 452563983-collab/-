export interface CardTransaction {
  id: string;
  name: string;
  setOrSeries: string;
  notes: string;
  imageUrl: string | null;
  
  // Buy Info
  buyDate: string; // ISO Date string YYYY-MM-DD
  buyPrice: number;
  
  // Sell Info
  isSold: boolean;
  sellDate: string | null; // ISO Date string YYYY-MM-DD
  sellPrice: number | null;
  
  createdAt: number;
}

export interface StatsSummary {
  totalInvested: number;
  totalSoldAmount: number;
  netProfit: number;
  roi: number; // Return on Investment %
  totalCards: number;
  soldCards: number;
}

export type ViewMode = 'dashboard' | 'inventory';

export type DateRangeFilter = 'all' | '7days' | '30days' | '90days' | 'year' | 'thisMonth' | 'lastMonth' | 'custom';
