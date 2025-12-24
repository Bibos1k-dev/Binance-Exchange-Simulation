
import React, { useState, useEffect } from 'react';
import { Language, translations } from '../locales';

interface TradePanelProps {
  type: 'buy' | 'sell';
  assetCode: string;
  currentPrice: number;
  onTrade: (type: 'buy' | 'sell', amount: number, price: number) => void;
  balance: number;
  active: boolean;
  onTabChange: () => void;
  lang: Language;
}

const TradePanel: React.FC<TradePanelProps> = ({ type, assetCode, currentPrice, onTrade, balance, active, onTabChange, lang }) => {
  const t = translations[lang];
  const [amount, setAmount] = useState<string>('0');
  const [total, setTotal] = useState<string>('0');

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    setTotal((numAmount * currentPrice).toFixed(2));
  }, [amount, currentPrice]);

  const handleTradeClick = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onTrade(type, numAmount, currentPrice);
      setAmount('0');
    }
  };

  const setPercent = (percent: number) => {
    if (type === 'buy') {
      const maxCanBuy = balance / currentPrice;
      setAmount((maxCanBuy * percent).toFixed(2));
    } else {
      setAmount((balance * percent).toFixed(2));
    }
  };

  return (
    <div 
      className={`flex-1 flex flex-col transition-opacity h-full min-h-[200px] md:min-h-[320px] justify-center ${active ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`} 
      onClick={onTabChange}
    >
      <div className="flex flex-col justify-between py-2 md:py-6">
        <div className="space-y-2 md:space-y-4">
          <div className="relative">
            <span className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-[8px] md:text-[10px] text-gray-500 font-bold uppercase select-none">{t.price}</span>
            <input 
              type="text" 
              readOnly 
              value={currentPrice.toFixed(2)} 
              className="w-full h-8 md:h-10 pl-12 md:pl-16 pr-10 md:pr-12 rounded-sm bg-[#2b3139] border border-transparent focus:border-[#f0b90b] outline-none text-right font-mono text-xs md:text-sm"
            />
            <span className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-[8px] md:text-[10px] text-gray-500 font-bold uppercase select-none">USDT</span>
          </div>

          <div className="relative">
            <span className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-[8px] md:text-[10px] text-gray-500 font-bold uppercase select-none">{t.amount}</span>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-8 md:h-10 pl-12 md:pl-16 pr-10 md:pr-12 rounded-sm bg-[#2b3139] border border-transparent focus:border-[#f0b90b] outline-none text-right font-mono text-xs md:text-sm"
            />
            <span className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-[8px] md:text-[10px] text-gray-500 font-bold uppercase select-none">{assetCode}</span>
          </div>

          <div className="flex justify-between gap-1 px-1 py-1">
            {[0.25, 0.5, 0.75, 1].map((p, i) => (
              <button 
                key={i} 
                onClick={(e) => { e.stopPropagation(); setPercent(p); }}
                className="flex-1 h-[3px] md:h-[4px] bg-[#474d57] hover:bg-[#f0b90b] transition-colors relative"
              >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 md:w-2 h-1.5 md:h-2 bg-[#474d57] hover:bg-[#f0b90b] border border-[#161a1e] rotate-45"></div>
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-[8px] md:text-[10px] text-gray-500 font-bold uppercase select-none">{t.total}</span>
            <div className="w-full h-8 md:h-10 pl-12 md:pl-16 pr-10 md:pr-12 rounded-sm bg-[#2b3139] flex items-center justify-end font-mono text-xs md:text-sm text-gray-400">
              {total}
            </div>
            <span className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-[8px] md:text-[10px] text-gray-500 font-bold uppercase select-none">USDT</span>
          </div>
        </div>

        <div className="mt-3 md:mt-6">
          <button 
            onClick={(e) => { e.stopPropagation(); handleTradeClick(); }}
            className={`w-full h-10 md:h-12 rounded-md font-bold text-black uppercase transition-all shadow-lg active:scale-95 mb-2 text-sm md:text-base tracking-widest ${type === 'buy' ? 'bg-[#0ecb81] hover:bg-[#0cb472]' : 'bg-[#f6465d] hover:bg-[#e03f53]'}`}
          >
            {type === 'buy' ? `${t.buy} ${assetCode}` : `${t.sell} ${assetCode}`}
          </button>
          
          <div className="flex justify-between text-[8px] md:text-[10px] font-bold text-gray-600 uppercase tracking-widest px-1">
            <span>{t.fee}</span>
            <span className="text-gray-400">{(parseFloat(total) * 0.001).toFixed(4)} USDT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradePanel;
