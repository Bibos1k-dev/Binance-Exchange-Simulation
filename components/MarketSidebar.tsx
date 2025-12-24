
import React, { useState } from 'react';
import { AssetType } from '../App';
import { Language, translations } from '../locales';

interface MarketSidebarProps {
  selectedAsset: string;
  globalPrices: Record<string, number>;
  favorites: string[];
  marketStats: Record<string, number>;
  onToggleFavorite: (id: string) => void;
  onSelectMarket: (id: string) => void;
  lang: Language;
  purchasedAssets: string[];
}

const MarketSidebar: React.FC<MarketSidebarProps> = ({ selectedAsset, globalPrices, favorites, marketStats, onToggleFavorite, onSelectMarket, lang, purchasedAssets }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  
  const allPairs: { id: AssetType; name: string; active: boolean }[] = [
    { id: 'BTC', name: 'BTC/USDT', active: true },
    { id: 'ETH', name: 'ETH/USDT', active: true },
    { id: 'BNB', name: 'BNB/USDT', active: true },
    { id: 'SOL', name: 'SOL/USDT', active: true },
    { id: 'XRP', name: 'XRP/USDT', active: true },
    { id: 'ADA', name: 'ADA/USDT', active: true },
    { id: 'DOT', name: 'DOT/USDT', active: true },
    { id: 'DOGE', name: 'DOGE/USDT', active: true },
    { id: 'LTC', name: 'LTC/USDT', active: true },
  ];

  const pairsToDisplay = activeTab === 'all' 
    ? allPairs 
    : allPairs.filter(p => favorites.includes(p.id));

  return (
    <div className="flex-1 flex flex-col min-h-0 border-b border-[#2b3139] bg-[#161a1e]">
      <div className="flex border-b border-[#2b3139]">
        <button 
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'all' ? 'binance-yellow border-yellow-500 bg-white/5' : 'text-gray-500 border-transparent hover:text-white'}`}
          onClick={() => setActiveTab('all')}
        >
          {t.pairs}
        </button>
        <button 
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'favorites' ? 'binance-yellow border-yellow-500 bg-white/5' : 'text-gray-500 border-transparent hover:text-white'}`}
          onClick={() => setActiveTab('favorites')}
        >
          {t.favs}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <table className="w-full text-[10px] text-left border-separate border-spacing-y-1">
          <thead className="text-gray-500 sticky top-0 bg-[#161a1e] z-10">
            <tr>
              <th className="pb-2 font-medium w-[45%]">Pair</th>
              <th className="pb-2 font-medium text-right w-[30%]">{t.price}</th>
              <th className="pb-2 font-medium text-right w-[25%]">{t.change}</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {pairsToDisplay.map((p) => {
              const isFav = favorites.includes(p.id);
              const isActive = selectedAsset === p.id;
              const isPurchased = purchasedAssets.includes(p.id);
              const currentPrice = globalPrices[p.id] || 0;
              const change = marketStats[p.id] || 0;
              const isUp = change >= 0;

              return (
                <tr 
                  key={p.id} 
                  onClick={() => p.active && isPurchased && onSelectMarket(p.id)}
                  className={`hover:bg-[#2b3139] transition-colors border-b border-white/5 ${
                    isActive ? 'bg-yellow-500/5' : ''
                  } ${!isPurchased ? 'opacity-30 cursor-not-allowed grayscale' : 'cursor-pointer group'}`}
                >
                  <td className={`py-2.5 ${isActive ? 'text-yellow-500' : 'text-gray-400'}`}>
                    <i 
                      className={`fa-star text-[9px] mr-2 cursor-pointer transition-colors hover:text-yellow-500 ${isFav ? 'fa-solid binance-yellow' : 'fa-regular text-gray-600'}`}
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite(p.id); }}
                    ></i> 
                    {p.name}
                    {!isPurchased && <i className="fa-solid fa-lock ml-2 text-[8px] text-gray-600"></i>}
                  </td>
                  <td className={`py-2.5 text-right font-bold ${isActive ? 'binance-green' : 'text-gray-200'}`}>
                    {isPurchased ? currentPrice.toLocaleString(undefined, { 
                        minimumFractionDigits: currentPrice < 1 ? 4 : 2,
                        maximumFractionDigits: currentPrice < 1 ? 4 : 2
                    }) : '---'}
                  </td>
                  <td className={`py-2.5 text-right font-bold ${isUp ? 'binance-green' : 'binance-red'}`}>
                    {isPurchased ? (isUp ? '+' : '') + change.toFixed(2) + '%' : '0.00%'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketSidebar;
