
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Language, translations } from '../locales';

interface OrderBookProps {
  currentPrice: number;
  assetCode: string;
  volatility: number;
  lang: Language;
}

interface OrderRow {
  price: number;
  amount: number;
  total: number;
  cumulative: number;
}

type ViewMode = 'both' | 'bids' | 'asks';

const formatPrice = (p: number) => {
  return p.toLocaleString(undefined, {
    minimumFractionDigits: p < 100 ? 6 : 2,
    maximumFractionDigits: p < 100 ? 6 : 2
  });
};

const OrderBook: React.FC<OrderBookProps> = ({ currentPrice, assetCode, volatility, lang }) => {
  const t = translations[lang];
  const [precision, setPrecision] = useState(currentPrice < 100 ? 6 : 2);
  const [isPrecisionMenuOpen, setIsPrecisionMenuOpen] = useState(false);
  const [lastPrice, setLastPrice] = useState(currentPrice);
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const precisionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPrecision(currentPrice < 100 ? 6 : 2);
    setLastPrice(currentPrice);
  }, [assetCode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (precisionMenuRef.current && !precisionMenuRef.current.contains(event.target as Node)) {
        setIsPrecisionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const orders = useMemo(() => {
    const askCount = viewMode === 'bids' ? 0 : (viewMode === 'asks' ? 28 : 14);
    const bidCount = viewMode === 'asks' ? 0 : (viewMode === 'bids' ? 28 : 14);
    
    const spread = volatility * 0.1;
    const asks: OrderRow[] = [];
    const bids: OrderRow[] = [];

    if (askCount > 0) {
      for (let i = askCount; i >= 1; i--) {
        const price = currentPrice + spread + (i * volatility * 0.05 * Math.random());
        const amount = (Math.random() * 10 + 0.1) * (assetCode === 'BTNC' ? 0.01 : 100);
        asks.push({ price, amount, total: price * amount, cumulative: 0 });
      }
      asks.sort((a, b) => b.price - a.price);
      let tempCumAsk = 0;
      for (let i = asks.length - 1; i >= 0; i--) {
        tempCumAsk += asks[i].amount;
        asks[i].cumulative = tempCumAsk;
      }
    }

    if (bidCount > 0) {
      for (let i = 1; i <= bidCount; i++) {
        const price = currentPrice - spread - (i * volatility * 0.05 * Math.random());
        const amount = (Math.random() * 10 + 0.1) * (assetCode === 'BTNC' ? 0.01 : 100);
        bids.push({ price, amount, total: price * amount, cumulative: 0 });
      }
      bids.sort((a, b) => b.price - a.price);
      let tempCumBid = 0;
      for (let i = 0; i < bids.length; i++) {
        tempCumBid += bids[i].amount;
        bids[i].cumulative = tempCumBid;
      }
    }

    const maxCumAsk = asks.length > 0 ? Math.max(...asks.map(a => a.cumulative)) : 1;
    const maxCumBid = bids.length > 0 ? Math.max(...bids.map(b => b.cumulative)) : 1;

    return { asks, bids, maxCumAsk, maxCumBid };
  }, [currentPrice, assetCode, volatility, viewMode]);

  const priceDirection = currentPrice >= lastPrice ? 'up' : 'down';

  const precisionOptions = useMemo(() => {
    return currentPrice < 100 ? [8, 7, 6, 5] : [2, 1, 0];
  }, [currentPrice]);

  const formatPrecisionOption = (p: number) => {
    if (p === 0) return '1';
    return `0.${'0'.repeat(p - 1)}1`;
  };

  const PriceDisplay = () => (
    <div className="py-3 px-3 border-y border-[#2b3139] bg-[#1e2329] flex items-center gap-2 shrink-0">
      <span className={`text-lg font-bold font-mono ${priceDirection === 'up' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
        {currentPrice.toFixed(precision)}
        <i className={`fa-solid ${priceDirection === 'up' ? 'fa-arrow-up' : 'fa-arrow-down'} ml-2 text-sm`}></i>
      </span>
      <span className="text-[10px] text-gray-500 font-mono mt-1 tracking-tighter">
        ${formatPrice(currentPrice)}
      </span>
      <i className="fa-solid fa-chevron-right ml-auto text-gray-700 text-[10px]"></i>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-[#161a1e] h-full select-none overflow-hidden relative">
      <div className="p-3 border-b border-[#2b3139] flex items-center justify-between shrink-0">
        <h3 className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">{t.orderBook}</h3>
      </div>

      <div className="px-3 py-2 flex items-center justify-between bg-[#161a1e] shrink-0 z-20">
        <div className="flex gap-2">
          {(['both', 'bids', 'asks'] as ViewMode[]).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} className={`w-6 h-6 flex items-center justify-center rounded-sm ${viewMode === mode ? 'bg-[#2b3139]' : 'hover:bg-[#2b3139]'}`}>
              <i className={`fa-solid ${mode === 'both' ? 'fa-layer-group text-yellow-500' : mode === 'bids' ? 'fa-align-left text-green-500' : 'fa-align-right text-red-500'}`}></i>
            </button>
          ))}
        </div>

        <div className="relative" ref={precisionMenuRef}>
          <div onClick={() => setIsPrecisionMenuOpen(!isPrecisionMenuOpen)} className="flex items-center gap-1 text-[10px] text-gray-500 font-mono bg-[#2b3139] px-1.5 py-0.5 rounded-sm cursor-pointer hover:text-white">
            <span>{formatPrecisionOption(precision)}</span>
            <i className={`fa-solid fa-caret-down text-[8px] transition-transform ${isPrecisionMenuOpen ? 'rotate-180' : ''}`}></i>
          </div>
          {isPrecisionMenuOpen && (
            <div className="absolute top-full right-0 mt-1 w-32 bg-[#1e2329] border border-[#2b3139] rounded shadow-xl z-50 py-1">
              {precisionOptions.map((opt) => (
                <div key={opt} onClick={() => { setPrecision(opt); setIsPrecisionMenuOpen(false); }} className={`px-3 py-1.5 flex items-center justify-between hover:bg-[#2b3139] cursor-pointer ${precision === opt ? 'text-white font-bold' : 'text-gray-400'}`}>
                  <span className="text-[10px] font-mono">{formatPrecisionOption(opt)}</span>
                  {precision === opt && <i className="fa-solid fa-check text-[8px] text-yellow-500"></i>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-3 py-1 grid grid-cols-3 text-[9px] font-bold text-gray-600 uppercase tracking-tighter shrink-0">
        <span>{t.price}</span>
        <span className="text-right">{t.amount}</span>
        <span className="text-right">{t.total}</span>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {viewMode === 'bids' && <PriceDisplay />}
        {(viewMode === 'both' || viewMode === 'asks') && (
          <div className="flex-1 overflow-hidden flex flex-col justify-end">
            {orders.asks.map((row, i) => (
              <div key={`ask-${i}`} className="relative h-5 group cursor-pointer hover:bg-white/5 shrink-0">
                <div className="absolute right-0 top-0 bottom-0 bg-red-500/10" style={{ width: `${(row.cumulative / orders.maxCumAsk) * 100}%` }} />
                <div className="relative px-3 grid grid-cols-3 items-center h-full text-[10px] font-mono">
                  <span className="text-[#f6465d] font-bold">{row.price.toFixed(precision)}</span>
                  <span className="text-right text-gray-300">{row.amount > 1000 ? (row.amount / 1000).toFixed(1) + 'K' : row.amount.toFixed(2)}</span>
                  <span className="text-right text-gray-400">{row.total.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {viewMode === 'both' && <PriceDisplay />}
        {(viewMode === 'both' || viewMode === 'bids') && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {orders.bids.map((row, i) => (
              <div key={`bid-${i}`} className="relative h-5 group cursor-pointer hover:bg-white/5 shrink-0">
                <div className="absolute right-0 top-0 bottom-0 bg-green-500/10" style={{ width: `${(row.cumulative / orders.maxCumBid) * 100}%` }} />
                <div className="relative px-3 grid grid-cols-3 items-center h-full text-[10px] font-mono">
                  <span className="text-[#0ecb81] font-bold">{row.price.toFixed(precision)}</span>
                  <span className="text-right text-gray-300">{row.amount > 1000 ? (row.amount / 1000).toFixed(1) + 'K' : row.amount.toFixed(2)}</span>
                  <span className="text-right text-gray-400">{row.total.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {viewMode === 'asks' && <PriceDisplay />}
      </div>
    </div>
  );
};

export default OrderBook;
