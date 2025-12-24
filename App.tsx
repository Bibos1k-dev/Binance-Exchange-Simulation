
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { PriceData, Trade, UserStats, Quest } from './types';
import Header from './components/Header';
import MarketChart from './components/MarketChart';
import TradePanel from './components/TradePanel';
import MarketSidebar from './components/MarketSidebar';
import RecentTrades from './components/RecentTrades';
import MarketSelection from './components/MarketSelection';
import Ticker from './components/Ticker';
import ClickerPanel from './components/ClickerPanel';
import TasksPanel from './components/TasksPanel';
import OrderBook from './components/OrderBook';
import { translations, Language } from './locales';

declare global {
  interface Window {
    YaGames: {
      init: () => Promise<any>;
    };
  }
}

type ViewState = 'landing' | 'market_select' | 'terminal';
export type AssetType = 'DOGE' | 'LTC' | 'ADA' | 'XRP' | 'DOT' | 'SOL' | 'BNB' | 'ETH' | 'BTC';

export const ASSET_CONFIG: Record<AssetType, { basePrice: number; volatility: number; name: string; icon: string; unlockPrice: number }> = {
  DOGE: { basePrice: 0.4285, volatility: 0.005, name: 'Dogecoin', icon: 'fa-dog', unlockPrice: 0 },
  LTC: { basePrice: 124.50, volatility: 0.8, name: 'Litecoin', icon: 'fa-coins', unlockPrice: 5000 },
  ADA: { basePrice: 1.1501, volatility: 0.02, name: 'Cardano', icon: 'fa-circle-nodes', unlockPrice: 25000 },
  XRP: { basePrice: 2.6842, volatility: 0.05, name: 'Ripple', icon: 'fa-shuffle', unlockPrice: 75000 },
  DOT: { basePrice: 84.20, volatility: 1.2, name: 'Polkadot', icon: 'fa-circle-dot', unlockPrice: 200000 },
  SOL: { basePrice: 342.88, volatility: 4.5, name: 'Solana', icon: 'fa-bolt-lightning', unlockPrice: 500000 },
  BNB: { basePrice: 1458.45, volatility: 15.0, name: 'Binance Coin', icon: 'fa-layer-group', unlockPrice: 1500000 },
  ETH: { basePrice: 4826.92, volatility: 50.0, name: 'Ethereum', icon: 'fa-gem', unlockPrice: 5000000 },
  BTC: { basePrice: 98580.61, volatility: 1000.0, name: 'Bitcoin', icon: 'fa-bitcoin-sign', unlockPrice: 20000000 }
};

const generateRandomQuests = (t: any, progressFactor: number): Quest[] => {
  const types: Quest['type'][] = ['clicks', 'sell_volume', 'buy_volume', 'trades_count'];
  const difficultyMultiplier = 1 + (progressFactor * 0.8);
  
  return types.map((type, i) => {
    const isVolume = type === 'sell_volume' || type === 'buy_volume';
    const baseTarget = isVolume 
      ? Math.floor(Math.random() * 2000) + 500 
      : type === 'clicks' 
        ? Math.floor(Math.random() * 1000) + 300
        : Math.floor(Math.random() * 10) + 5;
    
    const target = Math.floor(baseTarget * difficultyMultiplier);
    const reward = Math.floor(target * (isVolume ? 0.3 : type === 'clicks' ? 1.5 : 50));
    
    return {
      id: `rq-${Date.now()}-${i}`,
      title: t.questTitles[type][Math.floor(Math.random() * t.questTitles[type].length)],
      description: type === 'clicks' 
        ? `${t.clickXTimes} ${target}` 
        : type === 'trades_count'
          ? `${t.completeXTrades} ${target}`
          : `${type === 'sell_volume' ? t.sellAssetsFor : t.buyAssetsFor} $${target}`,
      target,
      current: 0,
      reward,
      isClaimed: false,
      type
    };
  });
};

const Snowfall: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full opacity-10 animate-snowfall"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            animationDuration: `${Math.random() * 15 + 10}s`,
            animationDelay: `${-Math.random() * 15}s`,
            top: '-10px',
          }}
        />
      ))}
      <style>{`
        @keyframes snowfall {
          0% { transform: translateY(-10px) translateX(0); }
          50% { transform: translateY(50vh) translateX(15px); }
          100% { transform: translateY(110vh) translateX(0); }
        }
        .animate-snowfall {
          animation: snowfall linear infinite;
        }
      `}</style>
    </div>
  );
};

const LoadingScreen: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(t.loading.nodes);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + Math.random() * 15;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        if (next > 75) setStatus(t.loading.terminal);
        else if (next > 50) setStatus(t.loading.assets);
        else if (next > 25) setStatus(t.loading.market);
        return next;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [t]);

  return (
    <div className="fixed inset-0 z-[999] bg-[#0b0e11] flex flex-col items-center justify-center p-8">
      <div className="w-32 h-32 mb-12 relative animate-in zoom-in duration-700">
        <div className="absolute inset-0 binance-bg-yellow rounded-3xl rotate-12 opacity-10 animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center text-6xl binance-yellow logo-glow">
          <i className="fa-solid fa-layer-group"></i>
        </div>
      </div>
      <h1 className="text-4xl font-black text-white italic tracking-tighter mb-8 animate-pulse">BINANCE</h1>
      <div className="w-full max-w-md h-1 bg-white/5 rounded-full overflow-hidden mb-4 border border-white/5">
        <div className="h-full binance-bg-yellow transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] animate-in fade-in slide-in-from-top-2 duration-300">
        {status}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState<Language>('ru');
  const t = translations[lang];

  const [viewState, setViewState] = useState<ViewState>('landing');
  const [selectedAsset, setSelectedAsset] = useState<AssetType>('DOGE');
  const [purchasedAssets, setPurchasedAssets] = useState<AssetType[]>(['DOGE']);
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [lastDirection, setLastDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [marketEvent, setMarketEvent] = useState<string | null>(null);
  
  const [globalPrices, setGlobalPrices] = useState<Record<AssetType, number>>(() => {
    const pricesObj = {} as Record<AssetType, number>;
    Object.entries(ASSET_CONFIG).forEach(([key, cfg]) => {
      pricesObj[key as AssetType] = cfg.basePrice;
    });
    return pricesObj;
  });

  const [marketStats, setMarketStats] = useState<Record<AssetType, number>>(() => {
    const stats = {} as Record<AssetType, number>;
    Object.keys(ASSET_CONFIG).forEach(asset => {
      stats[asset as AssetType] = (Math.random() * 12) - 4;
    });
    return stats;
  });

  const [userStats, setUserStats] = useState<UserStats>({
    balanceUSD: 1000, 
    balances: { DOGE: 1000, BTC: 0, ETH: 0, BNB: 0, SOL: 0, XRP: 0, ADA: 0, DOT: 0, LTC: 0 }
  });
  
  const [quests, setQuests] = useState<Quest[]>([]);
  const [tasksCooldownEnd, setTasksCooldownEnd] = useState<number | null>(null);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState<number>(0);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [ysdk, setYsdk] = useState<any>(null);
  const [clickValue, setClickValue] = useState(10); 
  const [passiveIncome, setPassiveIncome] = useState(0);
  const [upgradeLevels, setUpgradeLevels] = useState<Record<string, number>>({
    'cpu': 0, 'bot': 0, 'server': 0, 'quantum': 0
  });

  const [marketTrades, setMarketTrades] = useState<Record<AssetType, Trade[]>>(() => {
    const obj = {} as Record<AssetType, Trade[]>;
    Object.keys(ASSET_CONFIG).forEach(k => obj[k as AssetType] = []);
    return obj;
  });
  const [userTradeHistory, setUserTradeHistory] = useState<Record<AssetType, Trade[]>>(() => {
    const obj = {} as Record<AssetType, Trade[]>;
    Object.keys(ASSET_CONFIG).forEach(k => obj[k as AssetType] = []);
    return obj;
  });

  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [isClickerOpen, setIsClickerOpen] = useState(false);
  // Default sidebars closed on small mobile screens
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(window.innerWidth > 1024);
  const [favorites, setFavorites] = useState<string[]>(['DOGE']);
  const [chartHeightRatio, setChartHeightRatio] = useState(60);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  
  const isResizing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const volatilityRef = useRef(1.0);
  const trendRef = useRef(0);

  useEffect(() => {
    const savedStats = localStorage.getItem('binance_user_stats');
    const savedUpgrades = localStorage.getItem('binance_upgrades');
    const savedQuests = localStorage.getItem('binance_quests');
    const savedClickValue = localStorage.getItem('binance_click_value');
    const savedPassiveIncome = localStorage.getItem('binance_passive_income');
    const savedCooldown = localStorage.getItem('binance_cooldown_end');
    const savedLang = localStorage.getItem('binance_lang');
    const savedAssets = localStorage.getItem('binance_purchased_assets');
    const savedFavorites = localStorage.getItem('binance_favorites');
    const savedHistory = localStorage.getItem('binance_user_history');

    if (savedStats) setUserStats(JSON.parse(savedStats));
    if (savedUpgrades) setUpgradeLevels(JSON.parse(savedUpgrades));
    if (savedClickValue) setClickValue(parseFloat(savedClickValue));
    if (savedPassiveIncome) setPassiveIncome(parseFloat(savedPassiveIncome));
    if (savedLang) setLang(savedLang as Language);
    if (savedAssets) setPurchasedAssets(JSON.parse(savedAssets));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedHistory) setUserTradeHistory(JSON.parse(savedHistory));
    
    const currentLang = (savedLang as Language) || 'ru';
    if (savedQuests) {
      setQuests(JSON.parse(savedQuests));
    } else {
      const pAssetsCount = savedAssets ? JSON.parse(savedAssets).length : 1;
      setQuests(generateRandomQuests(translations[currentLang], pAssetsCount));
    }

    if (savedCooldown) {
      const end = parseInt(savedCooldown);
      if (end > Date.now()) setTasksCooldownEnd(end);
    }

    const timer = setTimeout(() => setIsLoading(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('binance_upgrades', JSON.stringify(upgradeLevels));
    localStorage.setItem('binance_quests', JSON.stringify(quests));
    localStorage.setItem('binance_click_value', clickValue.toString());
    localStorage.setItem('binance_passive_income', passiveIncome.toString());
    localStorage.setItem('binance_lang', lang);
    localStorage.setItem('binance_purchased_assets', JSON.stringify(purchasedAssets));
    localStorage.setItem('binance_favorites', JSON.stringify(favorites));
    localStorage.setItem('binance_user_history', JSON.stringify(userTradeHistory));
    if (tasksCooldownEnd) localStorage.setItem('binance_cooldown_end', tasksCooldownEnd.toString());
    else localStorage.removeItem('binance_cooldown_end');
  }, [upgradeLevels, quests, clickValue, passiveIncome, tasksCooldownEnd, lang, purchasedAssets, favorites, userTradeHistory]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem('binance_user_stats', JSON.stringify(userStats));
      setShowSaveIndicator(true);
      setTimeout(() => setShowSaveIndicator(false), 2000);
    }, 10000); 
    return () => clearInterval(saveInterval);
  }, [userStats]);

  useEffect(() => {
    const eventInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        const assets = purchasedAssets;
        const randomAsset = assets[Math.floor(Math.random() * assets.length)];
        const eventPool = ['whale', 'elon', 'crash', 'pump'];
        const eventType = eventPool[Math.floor(Math.random() * eventPool.length)];
        const eventText = t.events[eventType as keyof typeof t.events].replace('{asset}', randomAsset);
        setMarketEvent(eventText);
        volatilityRef.current = eventType === 'whale' || eventType === 'elon' || eventType === 'pump' ? 4.0 : 6.0;
        trendRef.current = eventType === 'elon' || eventType === 'pump' ? 0.8 : (eventType === 'crash' ? -0.8 : 0);
        setTimeout(() => {
          setMarketEvent(null);
          volatilityRef.current = 1.0;
          trendRef.current = 0;
        }, 8000);
      }
    }, 45000);
    return () => clearInterval(eventInterval);
  }, [purchasedAssets, t]);

  useEffect(() => {
    const initSDK = async () => {
      try { if (window.YaGames) { const sdk = await window.YaGames.init(); setYsdk(sdk); } } catch (err) { console.error('SDK Init failed', err); }
    };
    initSDK();
  }, []);

  useEffect(() => {
    if (quests.length > 0 && quests.every(q => q.isClaimed) && tasksCooldownEnd === null) {
      setTasksCooldownEnd(Date.now() + 5 * 60 * 1000);
    }
  }, [quests, tasksCooldownEnd]);

  useEffect(() => {
    if (tasksCooldownEnd === null) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, tasksCooldownEnd - Date.now());
      setCooldownTimeLeft(Math.floor(remaining / 1000));
      if (remaining <= 0) {
        setQuests(generateRandomQuests(t, purchasedAssets.length));
        setTasksCooldownEnd(null);
        setCooldownTimeLeft(0);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [tasksCooldownEnd, t, purchasedAssets.length]);

  useEffect(() => {
    const config = ASSET_CONFIG[selectedAsset];
    const initialPrices: PriceData[] = [];
    let lastP = globalPrices[selectedAsset] || config.basePrice;
    const volatility = config.volatility;
    const now = Date.now();
    for (let i = 150; i >= 0; i--) {
      const change = (Math.random() - 0.48) * volatility;
      const price = Math.max(0.0000001, lastP + change);
      initialPrices.push({
        time: new Date(now - i * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        price: price, open: lastP, high: price + (volatility * 0.2), low: price - (volatility * 0.2), close: price
      });
      lastP = price;
    }
    setPrices(initialPrices);
    setGlobalPrices(prev => ({ ...prev, [selectedAsset]: lastP }));
  }, [selectedAsset]);

  useEffect(() => {
    if (passiveIncome <= 0) return;
    const interval = setInterval(() => {
      setUserStats(prev => ({ ...prev, balanceUSD: prev.balanceUSD + (passiveIncome / 10) }));
    }, 100);
    return () => clearInterval(interval);
  }, [passiveIncome]);

  const calculateInitialLayout = useCallback(() => {
    if (!containerRef.current) return;
    const totalHeight = containerRef.current.offsetHeight;
    if (totalHeight > 0) {
      const minTradeHeight = window.innerWidth < 768 ? 200 : 340;
      const maxChartPct = ((totalHeight - minTradeHeight) / totalHeight) * 100;
      setChartHeightRatio(prev => {
        const next = Math.max(20, Math.min(80, maxChartPct));
        return Math.abs(prev - next) > 1 ? next : prev;
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (viewState === 'terminal') {
      const timer = setTimeout(calculateInitialLayout, 100);
      window.addEventListener('resize', calculateInitialLayout);
      return () => { clearTimeout(timer); window.removeEventListener('resize', calculateInitialLayout); };
    }
  }, [viewState, calculateInitialLayout]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalPrices(prevPrices => {
        const nextPrices = { ...prevPrices };
        const nextStats = { ...marketStats };
        const nextMarketTrades = { ...marketTrades };
        Object.keys(ASSET_CONFIG).forEach(key => {
          const asset = key as AssetType;
          const config = ASSET_CONFIG[asset];
          const baseVol = config.volatility;
          const currentP = prevPrices[asset];
          const isSelected = asset === selectedAsset;
          const baseChange = (Math.random() - 0.5 + trendRef.current * (isSelected ? 0.3 : 0.05)) * baseVol;
          const change = baseChange * (isSelected ? volatilityRef.current : 1.0);
          const nextP = Math.max(0.0000001, currentP + change);
          nextPrices[asset] = nextP;
          nextStats[asset] = (nextStats[asset] || 0) + (change / config.basePrice * 100);
          if (Math.random() > 0.8) {
            const fakeTrade: Trade = {
              id: Math.random().toString(36).substr(2, 9),
              price: nextP + (Math.random() - 0.5) * (baseVol * 0.2),
              amount: asset === 'BTC' ? Math.random() * 0.005 : Math.random() * 50,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              type: Math.random() > 0.5 ? 'buy' : 'sell'
            };
            nextMarketTrades[asset] = [fakeTrade, ...nextMarketTrades[asset].slice(0, 24)];
          }
          if (asset === selectedAsset) {
            setLastDirection(nextP > currentP ? 'up' : 'down');
            setPrices(currentHistory => {
              if (currentHistory.length === 0) return [];
              const last = currentHistory[currentHistory.length - 1];
              const newPoint: PriceData = {
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                price: nextP, open: last.close, high: Math.max(last.close, nextP) + (baseVol * 0.6), low: Math.min(last.close, nextP) - (baseVol * 0.6), close: nextP
              };
              return [...currentHistory.slice(-149), newPoint];
            });
          }
        });
        setMarketStats(nextStats);
        setMarketTrades(nextMarketTrades);
        return nextPrices;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedAsset, marketStats, marketTrades]);

  const updateQuestProgress = (type: Quest['type'], amount: number) => {
    if (tasksCooldownEnd !== null) return;
    setQuests(prev => prev.map(q => {
      if (q.type === type && !q.isClaimed) {
        return { ...q, current: Math.min(q.target, q.current + amount) };
      }
      return q;
    }));
  };

  const handleTrade = (type: 'buy' | 'sell', amount: number, price: number) => {
    const cost = amount * price;
    if (type === 'buy') {
      if (cost <= 0) return;
      if (userStats.balanceUSD >= cost) {
        setUserStats(prev => ({
          ...prev, balanceUSD: prev.balanceUSD - cost,
          balances: { ...prev.balances, [selectedAsset]: (prev.balances[selectedAsset] || 0) + amount }
        }));
        updateQuestProgress('buy_volume', cost);
        updateQuestProgress('trades_count', 1);
        const newTrade: Trade = {
          id: 'user-' + Date.now(), price, amount, type: 'buy',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        setUserTradeHistory(prev => ({ ...prev, [selectedAsset]: [newTrade, ...prev[selectedAsset].slice(0, 49)] }));
      } else { alert(t.insufficientUsdt); }
    } else {
      if (amount <= 0) return;
      const currentAssetBalance = userStats.balances[selectedAsset] || 0;
      if (currentAssetBalance >= amount) {
        setUserStats(prev => ({
          ...prev, balanceUSD: prev.balanceUSD + cost,
          balances: { ...prev.balances, [selectedAsset]: (prev.balances[selectedAsset] || 0) - amount }
        }));
        updateQuestProgress('sell_volume', cost);
        updateQuestProgress('trades_count', 1);
        const newTrade: Trade = {
          id: 'user-' + Date.now(), price, amount, type: 'sell',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        setUserTradeHistory(prev => ({ ...prev, [selectedAsset]: [newTrade, ...prev[selectedAsset].slice(0, 49)] }));
      } else { alert(`${t.insufficientAssets} ${selectedAsset}!`); }
    }
  };

  const handleUnlockAsset = (asset: AssetType) => {
    const price = ASSET_CONFIG[asset].unlockPrice;
    if (userStats.balanceUSD >= price) {
      setUserStats(p => ({ ...p, balanceUSD: p.balanceUSD - price }));
      setPurchasedAssets(prev => [...prev, asset]);
    } else { alert(t.insufficientUsdt); }
  };

  const handleShowVideoAd = () => {
    const adReward = 5000 * purchasedAssets.length;
    if (ysdk?.adv) {
      ysdk.adv.showRewardedVideo({
        callbacks: {
          onRewarded: () => { setUserStats(prev => ({ ...prev, balanceUSD: prev.balanceUSD + adReward })); },
          onError: (e: any) => console.error("Ad error", e)
        }
      });
    } else {
      setUserStats(prev => ({ ...prev, balanceUSD: prev.balanceUSD + adReward }));
    }
  };

  const handleSkipCooldownAd = () => {
    if (ysdk?.adv) {
        ysdk.adv.showRewardedVideo({
            callbacks: {
                onRewarded: () => {
                    setQuests(generateRandomQuests(t, purchasedAssets.length));
                    setTasksCooldownEnd(null);
                    setCooldownTimeLeft(0);
                },
                onError: (e: any) => console.error("Ad error", e)
            }
        });
    } else {
        setQuests(generateRandomQuests(t, purchasedAssets.length));
        setTasksCooldownEnd(null);
        setCooldownTimeLeft(0);
    }
  };

  const handleClaimQuest = (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (quest && quest.current >= quest.target && !quest.isClaimed) {
      setUserStats(prev => ({ ...prev, balanceUSD: prev.balanceUSD + quest.reward }));
      setQuests(prev => prev.map(q => q.id === id ? { ...q, isClaimed: true } : q));
    }
  };

  const onSelectMarket = (assetId: string) => {
    if (purchasedAssets.includes(assetId as AssetType)) {
      setSelectedAsset(assetId as AssetType);
      setViewState('terminal');
    }
  };

  const LanguageSelector = () => (
    <div className="fixed bottom-6 right-6 z-[200]">
      <div className="relative">
        <button 
          onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
          className="bg-[#1e2329] border border-[#2b3139] px-4 py-2 rounded-xl flex items-center gap-3 hover:bg-[#2b3139] transition-all shadow-xl group"
        >
          <i className="fa-solid fa-language binance-yellow text-lg"></i>
          <span className="text-white font-bold text-xs uppercase tracking-widest group-hover:binance-yellow">
            {t.langLabel}
          </span>
          <i className={`fa-solid fa-chevron-up text-[10px] text-gray-500 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`}></i>
        </button>
        
        {isLangMenuOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-40 bg-[#1e2329] border border-[#2b3139] rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button 
              onClick={() => { setLang('ru'); setIsLangMenuOpen(false); }}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2b3139] transition-colors ${lang === 'ru' ? 'bg-[#2b3139]' : ''}`}
            >
              <span className="text-lg">🇷🇺</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Русский</span>
            </button>
            <button 
              onClick={() => { setLang('en'); setIsLangMenuOpen(false); }}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2b3139] transition-colors ${lang === 'en' ? 'bg-[#2b3139]' : ''}`}
            >
              <span className="text-lg">🇺🇸</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">English</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0b0e11] relative select-none">
      {isLoading && <LoadingScreen lang={lang} />}
      {viewState !== 'terminal' && <Snowfall />}
      
      {showSaveIndicator && (
        <div className="fixed bottom-6 left-6 z-[1000] flex items-center gap-2 bg-[#1e2329]/80 border border-green-500/30 px-3 py-1.5 rounded-full backdrop-blur-sm animate-in fade-in slide-in-from-left-4 duration-300">
          <i className="fa-solid fa-cloud-check text-green-500 text-[10px]"></i>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{t.autoSaved}</span>
        </div>
      )}

      <div className="shrink-0 h-7 relative z-[100]">
        <Ticker marketStats={marketStats} globalPrices={globalPrices} lang={lang} />
      </div>
      
      {viewState === 'landing' && (
        <div className="flex-1 flex flex-col relative z-10 animate-in fade-in duration-700 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <nav className="h-24 px-6 md:px-12 flex items-center justify-between shrink-0">
            <div 
              onClick={() => setViewState('landing')}
              className="flex items-center gap-4 group cursor-pointer"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 binance-bg-yellow rounded-xl flex items-center justify-center text-black shadow-lg shadow-yellow-500/20 logo-glow transition-transform group-hover:scale-110">
                <i className="fa-solid fa-layer-group text-xl"></i>
              </div>
              <span className="text-2xl md:text-3xl font-black binance-yellow tracking-tighter italic uppercase">BINANCE</span>
            </div>
            <div className="hidden md:flex items-center gap-10">
               <button 
                onClick={() => setViewState('market_select')}
                className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em] cursor-pointer hover:text-white hover:scale-105 transition-all outline-none"
               >
                 {t.exchange}
               </button>
               <button 
                onClick={() => setIsClickerOpen(true)}
                className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em] cursor-pointer hover:text-white hover:scale-105 transition-all outline-none"
               >
                 {t.institutional}
               </button>
               <button 
                onClick={() => setIsTasksOpen(true)}
                className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em] cursor-pointer hover:text-white hover:scale-105 transition-all outline-none"
               >
                 {t.charity}
               </button>
            </div>
          </nav>

          <main className="shrink-0 max-w-7xl mx-auto w-full px-6 md:px-12 py-8 flex flex-col items-center justify-center text-center">
            <div className="max-w-4xl">
              <div className="inline-block px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-6 md:mb-8">
                <span className="text-[10px] binance-yellow font-black uppercase tracking-[0.3em]">{t.newListing}</span>
              </div>
              <h1 className="text-5xl md:text-9xl font-black text-white italic tracking-tighter leading-[0.85] mb-6 md:mb-8 animate-in slide-in-from-top-12 duration-1000">
                {lang === 'ru' ? 'ТОРГУЙ' : 'TRADE'} <span className="binance-yellow italic">{lang === 'ru' ? 'КРИПТОЙ' : 'CRYPTO'}</span> <br className="hidden md:block"/> {lang === 'ru' ? 'КАК ПРОФИ' : 'LIKE A PRO'}
              </h1>
              <p className="text-gray-400 text-base md:text-2xl max-w-3xl mb-8 md:mb-12 font-medium leading-relaxed mx-auto">{t.heroSub}</p>
              
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-12 md:mb-16">
                <button onClick={() => setViewState('market_select')} className="binance-bg-yellow text-black font-black py-5 md:py-6 px-12 md:px-20 rounded-2xl hover:scale-105 transition-all text-sm uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(240,185,11,0.3)] active:scale-95">
                  {t.getStarted}
                </button>
                <div className="px-6 md:px-10 py-4 md:py-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md flex flex-col justify-center">
                   <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">{t.marketVolume24h}</span>
                   <span className="text-lg md:text-xl font-mono font-bold text-white">$76,420,158,294.00</span>
                </div>
              </div>

              {/* Other Exchanges / Partners Section */}
              <div className="pt-12 border-t border-white/5 w-full pb-20">
                 <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.5em] mb-8">{t.liquidityPartners}</p>
                 <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-40 grayscale transition-all duration-700">
                    <button onClick={() => setViewState('market_select')} className="flex items-center gap-2 md:gap-3 hover:opacity-100 hover:grayscale-0 hover:scale-110 transition-all outline-none group">
                       <i className="fa-solid fa-k text-xl md:text-2xl text-white group-hover:text-blue-400 transition-colors"></i>
                       <span className="text-base md:text-lg font-black tracking-tighter text-white">KRAKEN</span>
                    </button>
                    <button onClick={() => setViewState('market_select')} className="flex items-center gap-2 md:gap-3 hover:opacity-100 hover:grayscale-0 hover:scale-110 transition-all outline-none group">
                       <i className="fa-solid fa-bolt text-xl md:text-2xl text-blue-500 group-hover:animate-pulse"></i>
                       <span className="text-base md:text-lg font-black tracking-tighter text-white uppercase">Coinbase</span>
                    </button>
                    <button onClick={() => setViewState('market_select')} className="flex items-center gap-2 md:gap-3 hover:opacity-100 hover:grayscale-0 hover:scale-110 transition-all outline-none group">
                       <i className="fa-solid fa-diamond text-xl md:text-2xl text-orange-500 group-hover:rotate-45 transition-transform"></i>
                       <span className="text-base md:text-lg font-black tracking-tighter text-white uppercase">Bybit</span>
                    </button>
                    <button onClick={() => setViewState('market_select')} className="flex items-center gap-2 md:gap-3 hover:opacity-100 hover:grayscale-0 hover:scale-110 transition-all outline-none group">
                       <i className="fa-solid fa-v text-xl md:text-2xl text-teal-400 group-hover:rotate-12 transition-transform"></i>
                       <span className="text-base md:text-lg font-black tracking-tighter text-white uppercase">OKX</span>
                    </button>
                 </div>
              </div>
            </div>
          </main>
          <LanguageSelector />
        </div>
      )}

      {viewState === 'market_select' && (
        <MarketSelection 
          globalPrices={globalPrices} marketStats={marketStats}
          onSelectCoin={onSelectMarket} onBack={() => setViewState('landing')} 
          favorites={favorites} onToggleFavorite={(id) => setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id])}
          lang={lang} purchasedAssets={purchasedAssets} onUnlock={handleUnlockAsset} balance={userStats.balanceUSD}
        />
      )}

      {viewState === 'terminal' && (
        <>
          <Header 
            userStats={userStats} currentPrice={globalPrices[selectedAsset]} performance24h={marketStats[selectedAsset]}
            direction={lastDirection} selectedAsset={selectedAsset}
            onHome={() => setViewState('market_select')} 
            onWalletClick={() => setIsClickerOpen(!isClickerOpen)} 
            onTasksClick={() => setIsTasksOpen(true)} 
            isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            isRightSidebarOpen={isRightSidebarOpen} onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            availableTasksCount={quests.filter(q => q.current >= q.target && !q.isClaimed).length}
            lang={lang}
          />
          {marketEvent && (
            <div className="bg-yellow-500/10 border-y border-yellow-500/20 py-1.5 px-6 flex items-center justify-center gap-3 animate-in slide-in-from-top-4 duration-500 relative z-40">
              <i className="fa-solid fa-triangle-exclamation binance-yellow text-xs"></i>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{marketEvent}</span>
              <div className="w-1 h-1 rounded-full binance-bg-yellow animate-ping"></div>
            </div>
          )}
          <div className="flex-1 flex min-h-0" ref={containerRef}>
            {isSidebarOpen && (
              <div className="absolute md:relative z-[60] w-72 md:w-80 h-full flex flex-col border-r border-[#2b3139] shrink-0 bg-[#0b0e11] overflow-hidden">
                <MarketSidebar 
                  selectedAsset={selectedAsset} globalPrices={globalPrices} favorites={favorites} marketStats={marketStats}
                  onToggleFavorite={(id) => setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id])} onSelectMarket={(id) => { onSelectMarket(id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                  lang={lang} purchasedAssets={purchasedAssets}
                />
                <RecentTrades marketTrades={marketTrades[selectedAsset]} userTrades={userTradeHistory[selectedAsset] || []} selectedAsset={selectedAsset} lang={lang} />
              </div>
            )}
            <div className="flex-1 flex min-h-0 min-w-0">
                <div className="flex-1 flex flex-col min-w-0">
                <div style={{ height: `${chartHeightRatio}%` }} className="border-b border-[#2b3139] relative">
                    <MarketChart data={prices} assetName={ASSET_CONFIG[selectedAsset].name} assetCode={selectedAsset} lang={lang} />
                </div>
                <div className="flex-1 flex flex-col min-h-0 relative">
                    <div className="hidden md:block absolute top-0 left-0 right-0 h-1 hover:bg-yellow-500/50 cursor-ns-resize z-50" onMouseDown={(e: any) => { isResizing.current = true; const move = (me: any) => { if (!isResizing.current) return; const rect = containerRef.current!.getBoundingClientRect(); const pct = ((me.clientY - rect.top) / rect.height) * 100; if (pct > 20 && pct < 80) setChartHeightRatio(pct); }; const up = () => { isResizing.current = false; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); }; window.addEventListener('mousemove', move); window.addEventListener('mouseup', up); }} />
                    <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-y-auto md:overflow-hidden">
                      <TradePanel type="buy" assetCode={selectedAsset} currentPrice={globalPrices[selectedAsset]} onTrade={handleTrade} balance={userStats.balanceUSD} active={activeTab === 'buy'} onTabChange={() => setActiveTab('buy')} lang={lang} />
                      <TradePanel type="sell" assetCode={selectedAsset} currentPrice={globalPrices[selectedAsset]} onTrade={handleTrade} balance={userStats.balances[selectedAsset] || 0} active={activeTab === 'sell'} onTabChange={() => setActiveTab('sell')} lang={lang} />
                    </div>
                </div>
                </div>
                {isRightSidebarOpen && (
                  <div className="absolute right-0 md:relative z-[60] w-64 md:w-72 h-full border-l border-[#2b3139] flex flex-col bg-[#161a1e] shrink-0 overflow-hidden shadow-2xl md:shadow-none">
                     <OrderBook currentPrice={globalPrices[selectedAsset]} assetCode={selectedAsset} volatility={ASSET_CONFIG[selectedAsset].volatility * volatilityRef.current} lang={lang} />
                  </div>
                )}
            </div>
          </div>
        </>
      )}
      {isClickerOpen && (
        <ClickerPanel onClose={() => setIsClickerOpen(false)} balance={userStats.balanceUSD} clickValue={clickValue} passiveIncome={passiveIncome} upgradeLevels={upgradeLevels} onCollect={() => { setUserStats(prev => ({ ...prev, balanceUSD: prev.balanceUSD + clickValue })); updateQuestProgress('clicks', 1); }} onShowAd={handleShowVideoAd} onBuyUpgrade={(id, cost, clickBoost, passiveBoost) => { if (userStats.balanceUSD >= cost) { setUserStats(p => ({ ...p, balanceUSD: p.balanceUSD - cost })); setUpgradeLevels(u => ({ ...u, [id]: u[id] + 1 })); if (clickBoost) setClickValue(v => v + clickBoost); if (passiveBoost) setPassiveIncome(v => v + passiveBoost); } else { alert(t.insufficientUsdt); } }} lang={lang} purchasedCount={purchasedAssets.length} />
      )}
      {isTasksOpen && (
        <TasksPanel quests={quests} onClose={() => setIsTasksOpen(false)} onClaim={handleClaimQuest} onWatchAd={(id) => { setQuests(prev => prev.map(q => q.id === id ? { ...q, isClaimed: true, current: q.target } : q)); }} onSkipAll={() => { setQuests(prev => prev.map(q => q.isClaimed ? q : { ...q, isClaimed: true })); }} cooldownTime={cooldownTimeLeft} onWatchCooldownAd={handleSkipCooldownAd} lang={lang} />
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        @media (max-width: 640px) {
          .xs-flex { display: flex; }
          .xs-hidden { display: none; }
        }
      `}</style>
    </div>
  );
};

export default App;
