
import React, { useState } from 'react';
import { Trade } from '../types';
import { Language, translations } from '../locales';

interface RecentTradesProps {
  marketTrades: Trade[];
  userTrades: Trade[];
  selectedAsset?: string;
  lang: Language;
}

const RecentTrades: React.FC<RecentTradesProps> = ({ marketTrades, userTrades, selectedAsset = 'CDY', lang }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'market' | 'user'>('market');

  const tradesToDisplay = activeTab === 'market' ? marketTrades : userTrades;

  return (
    <div className="flex-1 flex flex-col bg-[#161a1e] min-h-0">
      <div className="flex border-b border-[#2b3139]">
        <button 
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'market' ? 'binance-yellow border-yellow-500 bg-white/5' : 'text-gray-500 border-transparent hover:text-white'}`}
          onClick={() => setActiveTab('market')}
        >
          {t.recentTrades}
        </button>
        <button 
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'user' ? 'binance-yellow border-yellow-500 bg-white/5' : 'text-gray-500 border-transparent hover:text-white'}`}
          onClick={() => setActiveTab('user')}
        >
          {t.myTrades}
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden px-3 py-2">
        <table className="w-full text-[10px] text-left table-fixed">
          <thead className="text-gray-500 sticky top-0 bg-[#161a1e] z-10">
            <tr>
              <th className="pb-2 font-medium">{t.price}</th>
              <th className="pb-2 font-medium text-right">{t.amount}({selectedAsset})</th>
              <th className="pb-2 font-medium text-right">{t.time}</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {tradesToDisplay.map((t) => (
              <tr key={t.id} className="animate-in fade-in duration-300 hover:bg-white/5">
                <td className={`py-1.5 ${t.type === 'buy' ? 'binance-green' : 'binance-red'}`}>
                  {t.price.toFixed(2)}
                </td>
                <td className="py-1.5 text-right text-white">
                  {t.amount.toFixed(4)}
                </td>
                <td className="py-1.5 text-right text-gray-500">
                  {t.time}
                </td>
              </tr>
            ))}
            {tradesToDisplay.length === 0 && (
              <tr>
                <td colSpan={3} className="py-12 text-center text-gray-600 italic text-[11px]">
                  {activeTab === 'market' ? t.waitingData : t.noHistory}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTrades;
