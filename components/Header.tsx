
import React, { useEffect, useState } from 'react';
import { UserStats } from '../types';
import { Language, translations } from '../locales';

interface HeaderProps {
  userStats: UserStats;
  currentPrice: number;
  performance24h: number;
  direction: 'up' | 'down' | 'neutral';
  selectedAsset: string;
  onHome: () => void;
  onWalletClick: () => void;
  onTasksClick: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isRightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
  availableTasksCount: number;
  lang: Language;
}

const ASSET_ICONS: Record<string, string> = {
  BTC: 'fa-bitcoin-sign',
  ETH: 'fa-gem',
  BNB: 'fa-layer-group',
  SOL: 'fa-bolt-lightning',
  XRP: 'fa-shuffle',
  ADA: 'fa-circle-nodes',
  DOT: 'fa-circle-dot',
  DOGE: 'fa-dog',
  LTC: 'fa-coins'
};

const formatPrice = (p: number) => {
  return p.toLocaleString(undefined, {
    minimumFractionDigits: p < 100 ? 6 : 2,
    maximumFractionDigits: p < 100 ? 6 : 2
  });
};

const Header: React.FC<HeaderProps> = ({ 
  userStats, 
  currentPrice, 
  performance24h,
  direction, 
  selectedAsset,
  onHome, 
  onWalletClick, 
  onTasksClick,
  isSidebarOpen, 
  onToggleSidebar,
  isRightSidebarOpen,
  onToggleRightSidebar,
  availableTasksCount,
  lang
}) => {
  const t = translations[lang];
  const [flash, setFlash] = useState<string>('');
  const [ping, setPing] = useState(24);

  useEffect(() => {
    if (direction === 'up') setFlash('text-green-400');
    else if (direction === 'down') setFlash('text-red-400');
    
    const timeout = setTimeout(() => setFlash(''), 300);
    return () => clearTimeout(timeout);
  }, [currentPrice, direction]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPing(Math.floor(Math.random() * 15) + 18);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const assetBalance = userStats.balances[selectedAsset] || 0;
  const assetIcon = ASSET_ICONS[selectedAsset] || 'fa-coins';
  const isPositive = performance24h >= 0;

  return (
    <header className="h-16 md:h-20 bg-[#1e2329] border-b border-[#2b3139] flex items-center px-4 md:px-6 gap-3 md:gap-8 shrink-0 relative z-50 overflow-hidden">
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button 
          onClick={onToggleSidebar}
          className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-colors border ${isSidebarOpen ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' : 'bg-[#2b3139] border-gray-700 text-gray-400 hover:text-white'}`}
        >
          <i className={`fa-solid ${isSidebarOpen ? 'fa-indent' : 'fa-outdent'}`}></i>
        </button>

        <div 
          onClick={onHome}
          className="flex items-center gap-2 md:gap-3 group cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 md:w-9 md:h-9 binance-bg-yellow rounded-lg flex items-center justify-center transform rotate-3 group-hover:rotate-12 transition-transform duration-500 shadow-lg shadow-yellow-500/10 logo-glow text-black">
              <i className={`fa-solid ${assetIcon} text-base md:text-lg`}></i>
          </div>
          <div className="flex flex-col hidden xs:flex">
              <span className="text-xl md:text-2xl font-black binance-yellow tracking-tighter leading-none italic uppercase">BINANCE</span>
              <div className="hidden md:flex items-center gap-2 mt-0.5">
                 <span className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.1em]">Core Node v.2.4</span>
                 <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[7px] text-green-500 font-bold uppercase">Stable</span>
                 </div>
              </div>
          </div>
        </div>
      </div>

      <div className="h-8 w-px bg-gray-700/50 hidden sm:block"></div>

      <div className="flex gap-4 md:gap-10 items-center overflow-hidden flex-1 md:flex-none">
        <div className="flex flex-col min-w-0">
          <span className="text-gray-500 text-[8px] md:text-[9px] uppercase font-bold tracking-wider mb-0.5">{selectedAsset}/USDT</span>
          <span className={`font-mono text-sm md:text-xl font-bold transition-colors duration-200 block truncate ${flash || 'text-white'}`}>
            ${formatPrice(currentPrice)}
          </span>
        </div>
        <div className="flex flex-col hidden md:flex">
          <span className="text-gray-500 text-[9px] uppercase font-bold tracking-wider mb-0.5">{t.hChange}</span>
          <span className={`font-mono text-xs font-bold ${isPositive ? 'binance-green' : 'binance-red'}`}>
            {isPositive ? '+' : ''}{performance24h.toFixed(2)}% 
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3 md:gap-6 shrink-0">
        <div className="flex flex-col items-end hidden lg:flex">
          <span className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-0.5">Wallet Balance</span>
          <span className="text-white font-mono text-base font-medium">
            ${userStats.balanceUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </span>
        </div>

        <div className="flex gap-1.5 md:gap-2">
            <button 
                onClick={onTasksClick}
                className="w-9 h-9 md:w-10 md:h-10 bg-[#2b3139] hover:bg-[#3b4149] rounded-lg transition-all flex items-center justify-center border border-gray-700 active:scale-90 relative"
            >
                <i className="fa-solid fa-list-check text-yellow-500 text-sm"></i>
                {availableTasksCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-black text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#1e2329] animate-bounce">
                    {availableTasksCount}
                  </span>
                )}
            </button>
            <button 
              onClick={onWalletClick}
              className="w-9 h-9 md:w-10 md:h-10 bg-[#2b3139] hover:bg-[#3b4149] rounded-lg transition-all flex items-center justify-center border border-gray-700 active:scale-90 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-yellow-500/5 animate-pulse"></div>
                <i className="fa-solid fa-wallet text-yellow-500 text-sm"></i>
            </button>
            <button 
                onClick={onHome}
                className="w-9 h-9 md:w-10 md:h-10 bg-[#2b3139] hover:bg-[#3b4149] rounded-lg transition-all flex items-center justify-center border border-gray-700 active:scale-90"
            >
                <i className="fa-solid fa-list-ul text-yellow-500 text-sm"></i>
            </button>
            
            <button 
              onClick={onToggleRightSidebar}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-colors border ${isRightSidebarOpen ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' : 'bg-[#2b3139] border-gray-700 text-gray-400 hover:text-white'} hidden xs:flex`}
            >
              <i className={`fa-solid ${isRightSidebarOpen ? 'fa-outdent rotate-180' : 'fa-indent rotate-180'}`}></i>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
