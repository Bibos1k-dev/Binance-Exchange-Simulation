
import React from 'react';
import { Language } from '../locales';

interface TickerProps {
  marketStats: Record<string, number>;
  globalPrices: Record<string, number>;
  lang: Language;
}

const Ticker: React.FC<TickerProps> = ({ marketStats, globalPrices, lang }) => {
  const tickerItems = [
    { id: 'BTC', pair: 'BTC/USDT' },
    { id: 'ETH', pair: 'ETH/USDT' },
    { id: 'BNB', pair: 'BNB/USDT' },
    { id: 'SOL', pair: 'SOL/USDT' },
    { id: 'XRP', pair: 'XRP/USDT' },
    { id: 'ADA', pair: 'ADA/USDT' },
    { id: 'DOT', pair: 'DOT/USDT' },
    { id: 'DOGE', pair: 'DOGE/USDT' },
    { id: 'LTC', pair: 'LTC/USDT' },
  ];

  return (
    <div className="h-7 w-full bg-[#161a1e] border-b border-[#2b3139] flex items-center overflow-hidden whitespace-nowrap z-[100] shrink-0 pointer-events-none">
      <div className="flex animate-ticker">
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => {
          const change = marketStats[item.id] || 0;
          const price = globalPrices[item.id] || 0;
          const isUp = change >= 0;
          return (
            <div key={idx} className="flex items-center px-6 gap-2 text-[10px] font-bold">
              <span className="text-white uppercase tracking-tight">{item.pair}</span>
              <span className={isUp ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>
                {isUp ? '+' : ''}{change.toFixed(2)}%
              </span>
              <span className="text-gray-400 font-mono">
                {price.toLocaleString(undefined, { 
                    minimumFractionDigits: price < 1 ? 4 : 2,
                    maximumFractionDigits: price < 1 ? 4 : 2
                })}
              </span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.3333%, 0, 0); }
        }
        .animate-ticker {
          display: flex;
          animation: ticker 40s linear infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default Ticker;
