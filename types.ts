
export interface PriceData {
  time: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Trade {
  id: string;
  price: number;
  amount: number;
  time: string;
  type: 'buy' | 'sell';
}

export interface UserStats {
  balanceUSD: number;
  balances: Record<string, number>;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  isClaimed: boolean;
  type: 'clicks' | 'sell_volume' | 'buy_volume' | 'trades_count';
}
