
import React, { useState } from 'react';
import { Language, translations } from '../locales';

interface Upgrade {
  id: string;
  nameKey: string;
  descriptionKey: string;
  baseCost: number;
  clickBoost: number;
  passiveBoost: number;
  icon: string;
}

const UPGRADES: Upgrade[] = [
  { 
    id: 'cpu', 
    nameKey: 'CPU Overclocking', 
    descriptionKey: 'Increases profit per click.', 
    baseCost: 15,
    clickBoost: 0.5,
    passiveBoost: 0, 
    icon: 'fa-microchip' 
  },
  { 
    id: 'bot', 
    nameKey: 'Auto-Mining Bot', 
    descriptionKey: 'Generates USDT every second.', 
    baseCost: 80,
    clickBoost: 0, 
    passiveBoost: 2.0,
    icon: 'fa-robot' 
  },
  { 
    id: 'server', 
    nameKey: 'Server Rack', 
    descriptionKey: 'High-performance cloud mining.', 
    baseCost: 500,
    clickBoost: 0.2,
    passiveBoost: 12.0,
    icon: 'fa-server' 
  },
  { 
    id: 'quantum', 
    nameKey: 'Quantum Node', 
    descriptionKey: 'Infinite liquidity generation.', 
    baseCost: 3500,
    clickBoost: 10.0,
    passiveBoost: 150.0,
    icon: 'fa-atom' 
  },
];

interface ClickerPanelProps {
  onClose: () => void;
  onCollect: () => void;
  balance: number;
  clickValue: number;
  passiveIncome: number;
  upgradeLevels: Record<string, number>;
  onBuyUpgrade: (id: string, cost: number, clickBoost: number, passiveBoost: number) => void;
  onShowAd: () => void;
  lang: Language;
  purchasedCount: number;
}

const ClickerPanel: React.FC<ClickerPanelProps> = ({ 
  onClose, 
  onCollect, 
  balance, 
  clickValue, 
  passiveIncome, 
  upgradeLevels,
  onBuyUpgrade,
  onShowAd,
  lang,
  purchasedCount
}) => {
  const t = translations[lang];
  const [clicks, setClicks] = useState<{id: number, x: number, y: number}[]>([]);

  const handlePointClick = (e: React.MouseEvent | React.TouchEvent) => {
    onCollect();
    const id = Date.now();
    
    // Get coordinates for float effect
    let x = 50;
    let y = 50;
    if ('clientX' in e) {
       x = 40 + Math.random() * 20;
    }

    setClicks(prev => [...prev, {id, x, y}]);
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== id));
    }, 1000);
  };

  const getUpgradeCost = (upgrade: Upgrade) => {
    return Math.floor(upgrade.baseCost * Math.pow(1.3, upgradeLevels[upgrade.id]));
  };

  const adReward = 5000 * purchasedCount;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-[#0b0e11]/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-5xl h-full md:h-[700px] bg-[#1e2329] border-none md:border md:border-[#2b3139] rounded-none md:rounded-2xl shadow-2xl flex flex-col md:flex-row relative overflow-hidden">
        
        {/* Main Clicker Area */}
        <div className="flex-[1.2] flex flex-col relative border-b md:border-b-0 md:border-r border-[#2b3139] min-h-[45%] md:min-h-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 md:w-64 md:h-64 bg-yellow-500/5 blur-[80px] md:blur-[100px] rounded-full"></div>
          
          <div className="p-4 md:p-6 border-b border-[#2b3139] flex items-center justify-between bg-[#1e2329] z-10 shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 binance-bg-yellow rounded flex items-center justify-center text-black">
                <i className="fa-solid fa-bolt-lightning text-xs md:text-sm"></i>
              </div>
              <div>
                <h2 className="text-white font-bold text-base md:text-lg leading-tight uppercase tracking-tighter italic">{t.terminal}</h2>
                <p className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.manualAutoMining}</p>
              </div>
            </div>
            
            <div className="flex gap-2 md:gap-4">
              <div className="text-right">
                <span className="text-[7px] md:text-[8px] text-gray-500 font-bold uppercase block tracking-wider">{t.perClick}</span>
                <span className="text-xs md:text-sm font-mono text-yellow-500 font-bold">+${clickValue.toFixed(1)}</span>
              </div>
              <div className="text-right">
                <span className="text-[7px] md:text-[8px] text-gray-500 font-bold uppercase block tracking-wider">{t.passive}</span>
                <span className="text-xs md:text-sm font-mono text-green-500 font-bold">+${passiveIncome.toFixed(1)}/s</span>
              </div>
              <button 
                onClick={onClose}
                className="md:hidden w-8 h-8 rounded-lg bg-[#2b3139] flex items-center justify-center text-gray-400 active:bg-red-500/20 active:text-red-500"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-12 relative overflow-hidden">
            <div className="text-center mb-4 md:mb-10">
              <span className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] block mb-1 md:mb-2">{t.availableAssets}</span>
              <div className="text-2xl md:text-5xl font-mono font-black text-white tracking-tighter">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="relative group">
              {clicks.map(c => (
                <div 
                  key={c.id} 
                  className="absolute top-0 left-1/2 -translate-x-1/2 text-yellow-500 font-bold text-lg md:text-xl pointer-events-none animate-float-up z-20"
                  style={{ left: `${c.x}%` }}
                >
                  +${clickValue.toFixed(1)}
                </div>
              ))}
              
              <button 
                onPointerDown={handlePointClick}
                className="w-32 h-32 md:w-56 md:h-56 rounded-full bg-gradient-to-b from-[#2b3139] to-[#161a1e] border-4 md:border-8 border-[#2b3139] flex flex-col items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] transform active:scale-90 transition-all group-hover:border-yellow-500/30"
              >
                <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-yellow-500/5 flex items-center justify-center shadow-inner group-hover:bg-yellow-500/10 transition-colors">
                  <i className="fa-solid fa-hand-pointer text-3xl md:text-6xl text-yellow-500/80 animate-pulse"></i>
                </div>
              </button>
              <div className="absolute -bottom-6 md:-bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[7px] md:text-[10px] text-yellow-500 font-bold uppercase tracking-[0.4em] animate-pulse">{t.touchCapture}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrades Sidebar / Bottom section */}
        <div className="flex-1 w-full md:w-80 bg-[#161a1e] flex flex-col min-h-0 md:h-full">
          <div className="p-4 md:p-6 border-b border-[#2b3139] flex items-center justify-between shrink-0 bg-[#161a1e]">
            <h3 className="text-white font-bold text-[10px] md:text-xs uppercase tracking-widest">{t.upgradesStore}</h3>
            <button 
              onClick={onClose}
              className="hidden md:flex w-6 h-6 rounded-md bg-[#2b3139] hover:bg-red-500/20 hover:text-red-500 transition-all items-center justify-center text-gray-500"
            >
              <i className="fa-solid fa-times text-xs"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 custom-scrollbar">
            {/* Moved Ad Button Here to avoid overlap */}
            <button 
                onClick={onShowAd}
                className="w-full p-3 md:p-4 bg-blue-600/10 border border-blue-500/30 rounded-xl text-blue-400 font-bold text-[9px] md:text-xs uppercase tracking-widest hover:bg-blue-600/20 transition-all flex items-center justify-center gap-2 md:gap-3 group mb-2 md:mb-4"
            >
                <i className="fa-solid fa-play text-blue-500 group-hover:scale-125 transition-transform"></i>
                {t.watchAdFor} <span className="text-white">+{adReward} USDT</span>
            </button>

            {UPGRADES.map((upgrade) => {
              const cost = getUpgradeCost(upgrade);
              const canAfford = balance >= cost;
              const level = upgradeLevels[upgrade.id] || 0;

              return (
                <button
                  key={upgrade.id}
                  disabled={!canAfford}
                  onClick={() => onBuyUpgrade(upgrade.id, cost, upgrade.clickBoost, upgrade.passiveBoost)}
                  className={`w-full text-left p-3 md:p-4 rounded-xl border transition-all relative group overflow-hidden ${
                    canAfford 
                    ? 'bg-[#2b3139]/40 border-gray-700 active:border-yellow-500/50 active:bg-[#2b3139]/60' 
                    : 'bg-[#1e2329] border-transparent opacity-50 grayscale'
                  }`}
                >
                  <div className="flex gap-3 md:gap-4 relative z-10">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0 ${canAfford ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-800 text-gray-600'}`}>
                      <i className={`fa-solid ${upgrade.icon} text-base md:text-lg`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <span className="text-white font-bold text-[10px] md:text-xs truncate uppercase tracking-tighter">{upgrade.nameKey}</span>
                        <span className="text-[8px] md:text-[9px] bg-white/5 px-1.5 py-0.5 rounded font-mono text-gray-400">{t.lvl} {level}</span>
                      </div>
                      <p className="text-[8px] md:text-[9px] text-gray-500 mb-2 leading-tight">{upgrade.descriptionKey}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                           <i className="fa-solid fa-coins text-[9px] md:text-[10px] text-yellow-500"></i>
                           <span className={`text-[10px] md:text-xs font-mono font-bold ${canAfford ? 'text-white' : 'text-red-400'}`}>${cost.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            {upgrade.clickBoost > 0 && <span className="text-[7px] md:text-[8px] text-green-500 font-bold uppercase tracking-tighter">+{upgrade.clickBoost}/click</span>}
                            {upgrade.passiveBoost > 0 && <span className="text-[7px] md:text-[8px] text-green-400 font-bold uppercase tracking-tighter">+{upgrade.passiveBoost}/s</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(0) translateX(-50%); }
          20% { opacity: 1; transform: translateY(-20px) translateX(-50%); }
          100% { opacity: 0; transform: translateY(-120px) translateX(-50%); }
        }
        .animate-float-up { animation: float-up 1s forwards cubic-bezier(0, 0, 0.2, 1); }
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
      `}</style>
    </div>
  );
};

export default ClickerPanel;
