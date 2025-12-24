
import React, { useState, useMemo } from 'react';
import { ASSET_CONFIG, AssetType } from '../App';
import { Language, translations } from '../locales';

interface MarketSelectionProps {
  globalPrices: Record<string, number>;
  marketStats: Record<string, number>;
  onSelectCoin: (coin: string) => void;
  onBack: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  lang: Language;
  purchasedAssets: string[];
  onUnlock: (asset: AssetType) => void;
  balance: number;
}

type SortKey = 'price' | 'change';
type SortDir = 'asc' | 'desc' | 'none';

const MarketSelection: React.FC<MarketSelectionProps> = ({ 
  globalPrices, marketStats, onSelectCoin, onBack, favorites, onToggleFavorite, lang, purchasedAssets, onUnlock, balance 
}) => {
  const t = translations[lang];
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('price');
  const [sortDir, setSortDir] = useState<SortDir>('none');
  
  const allAssets = useMemo(() => {
    return Object.entries(ASSET_CONFIG).map(([id, config]) => {
      const changeNum = marketStats[id as AssetType] || 0;
      const currentPrice = globalPrices[id as AssetType] || config.basePrice;
      return {
        id: id as AssetType,
        name: config.name,
        pair: `${id}/USDT`,
        price: currentPrice,
        changeNum,
        change: `${changeNum >= 0 ? '+' : ''}${changeNum.toFixed(2)}%`,
        active: true,
        icon: config.icon,
        isLocked: !purchasedAssets.includes(id),
        unlockPrice: config.unlockPrice
      };
    });
  }, [globalPrices, marketStats, purchasedAssets]);

  const sortedAndFilteredAssets = useMemo(() => {
    let list = activeFilter === 'all' 
      ? allAssets 
      : allAssets.filter(asset => favorites.includes(asset.id));

    if (sortDir !== 'none') {
      list = [...list].sort((a, b) => {
        let valA = sortKey === 'price' ? a.price : a.changeNum;
        let valB = sortKey === 'price' ? b.price : b.changeNum;
        if (sortDir === 'asc') return valA - valB;
        return valB - valA;
      });
    }

    return list;
  }, [allAssets, activeFilter, favorites, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('desc');
    } else {
      if (sortDir === 'desc') setSortDir('asc');
      else if (sortDir === 'asc') setSortDir('none');
      else setSortDir('desc');
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key || sortDir === 'none') return <i className="fa-solid fa-sort text-gray-700 ml-1"></i>;
    if (sortDir === 'asc') return <i className="fa-solid fa-sort-up binance-yellow ml-1"></i>;
    return <i className="fa-solid fa-sort-down binance-yellow ml-1"></i>;
  };

  return (
    <div className="flex-1 bg-[#0b0e11] flex flex-col p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 gap-4">
            <div>
                <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-2 mb-2 group">
                    <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> {t.backToStart}
                </button>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight italic uppercase">{t.marketPortal.split(' ')[0]} <span className="binance-yellow">{t.marketPortal.split(' ')[1]}</span></h1>
            </div>
            <div className="flex flex-col items-start md:items-end w-full md:w-auto p-4 md:p-0 bg-white/5 md:bg-transparent rounded-xl border border-white/5 md:border-none">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mb-1">Available USDT</div>
                <div className="text-2xl font-black text-white font-mono">${balance.toLocaleString()}</div>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-2 md:gap-4">
            <div className="grid grid-cols-2 md:grid-cols-5 px-4 md:px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 select-none">
                <div className="md:col-span-2">Market / Pair</div>
                <div className="text-right cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('price')}>
                  {t.lastPrice} {getSortIcon('price')}
                </div>
                <div className="text-right hidden md:block cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('change')}>
                  {t.hChange} {getSortIcon('change')}
                </div>
                <div className="text-right hidden md:block">{t.action}</div>
            </div>

            {sortedAndFilteredAssets.map((asset) => {
                const isFav = favorites.includes(asset.id);
                const canUnlock = balance >= asset.unlockPrice;

                return (
                    <div 
                        key={asset.id}
                        onClick={() => !asset.isLocked && onSelectCoin(asset.id)}
                        className={`grid grid-cols-2 md:grid-cols-5 items-center px-4 md:px-6 py-4 md:py-5 rounded-xl border border-transparent transition-all group ${
                            !asset.isLocked 
                            ? 'bg-[#1e2329]/50 hover:bg-[#1e2329] hover:border-gray-700 cursor-pointer' 
                            : 'bg-[#1e2329]/20 border-white/5 cursor-default'
                        }`}
                    >
                        <div className="md:col-span-2 flex items-center gap-3 md:gap-4">
                            <i 
                                className={`fa-star text-base md:text-lg cursor-pointer transition-all active:scale-125 hover:text-yellow-500 ${isFav ? 'fa-solid binance-yellow' : 'fa-regular text-gray-700'}`}
                                onClick={(e) => { e.stopPropagation(); onToggleFavorite(asset.id); }}
                            ></i>
                            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-lg shadow-inner ${!asset.isLocked ? 'binance-bg-yellow text-black' : 'bg-gray-800 text-gray-600'}`}>
                                <i className={`fa-solid ${asset.isLocked ? 'fa-lock' : asset.icon}`}></i>
                            </div>
                            <div className="overflow-hidden">
                                <div className={`font-bold text-sm md:text-lg flex items-center gap-2 truncate ${asset.isLocked ? 'text-gray-500' : 'text-white'}`}>
                                    {asset.name}
                                    <span className="hidden md:inline text-[10px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">Live</span>
                                </div>
                                <div className="text-gray-600 text-[10px] md:text-xs font-mono">{asset.pair}</div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end md:items-end">
                          <div className={`text-right font-mono text-sm md:text-lg font-medium ${asset.isLocked ? 'text-gray-700' : 'text-white'}`}>
                              {asset.isLocked ? '---' : asset.price.toLocaleString(undefined, { 
                                  minimumFractionDigits: asset.price < 0.1 ? 6 : (asset.price < 1 ? 4 : 2),
                                  maximumFractionDigits: asset.price < 0.1 ? 6 : (asset.price < 1 ? 4 : 2)
                              })}
                          </div>
                          <div className={`text-right font-mono font-bold text-[10px] md:text-base block md:hidden ${asset.isLocked ? 'text-gray-800' : (asset.changeNum >= 0 ? 'binance-green' : 'binance-red')}`}>
                              {asset.isLocked ? '0.00%' : asset.change}
                          </div>
                          {/* Mobile Unlock Button */}
                          {asset.isLocked && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onUnlock(asset.id); }}
                              className={`mt-1 px-2 py-1 rounded font-black text-[8px] uppercase tracking-wider transition-all border block md:hidden ${
                                canUnlock ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'border-gray-800 text-gray-700 cursor-not-allowed'
                              }`}
                            >
                              ${asset.unlockPrice >= 1000000 ? (asset.unlockPrice/1000000).toFixed(1) + 'M' : (asset.unlockPrice/1000).toFixed(0) + 'K'}
                            </button>
                          )}
                        </div>
                        
                        <div className={`text-right font-mono font-bold hidden md:block ${asset.isLocked ? 'text-gray-800' : (asset.changeNum >= 0 ? 'binance-green' : 'binance-red')}`}>
                            {asset.isLocked ? '0.00%' : asset.change}
                        </div>

                        <div className="text-right hidden md:block">
                            {asset.isLocked ? (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onUnlock(asset.id); }}
                                  className={`px-4 py-2 rounded font-black text-[9px] uppercase tracking-[0.2em] transition-all border ${
                                    canUnlock ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500 hover:text-black' : 'border-gray-800 text-gray-700 cursor-not-allowed'
                                  }`}
                                >
                                  {t.unlock} | ${asset.unlockPrice.toLocaleString()}
                                </button>
                            ) : (
                                <button className="binance-bg-yellow text-black px-6 py-2 rounded font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-yellow-500/10">
                                    {t.tradeNow}
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default MarketSelection;
