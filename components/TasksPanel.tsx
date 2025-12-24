
import React from 'react';
import { Quest } from '../types';
import { Language, translations } from '../locales';

interface TasksPanelProps {
  quests: Quest[];
  onClose: () => void;
  onClaim: (id: string) => void;
  onWatchAd: (id: string) => void;
  onSkipAll: () => void;
  onWatchCooldownAd?: () => void;
  cooldownTime?: number;
  lang: Language;
}

const TasksPanel: React.FC<TasksPanelProps> = ({ quests, onClose, onClaim, onWatchAd, onSkipAll, onWatchCooldownAd, cooldownTime = 0, lang }) => {
  const t = translations[lang];
  const hasUnclaimed = quests.some(q => !q.isClaimed);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-[#0b0e11]/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#1e2329] border-none md:border md:border-[#2b3139] rounded-none md:rounded-2xl shadow-2xl flex flex-col relative overflow-hidden h-full md:h-[80vh]">
        <div className="p-4 md:p-6 border-b border-[#2b3139] flex items-center justify-between bg-[#161a1e] shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-8 md:h-8 binance-bg-yellow rounded flex items-center justify-center text-black">
              <i className="fa-solid fa-trophy text-xs md:text-sm"></i>
            </div>
            <div>
              <h2 className="text-white font-bold text-base md:text-lg leading-tight uppercase tracking-tighter italic">{t.missionHub}</h2>
              <p className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.missionHubSub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {cooldownTime <= 0 && hasUnclaimed && (
              <button 
                onClick={onSkipAll}
                className="hidden sm:flex px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-[8px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest items-center gap-2 border border-gray-700"
              >
                <i className="fa-solid fa-forward-step"></i> {t.skipAll}
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#2b3139] hover:bg-red-500/20 hover:text-red-500 transition-all flex items-center justify-center text-gray-500"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 custom-scrollbar">
          {cooldownTime > 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 md:p-10 animate-in zoom-in duration-500">
               <div className="w-20 h-20 md:w-24 md:h-24 mb-6 relative">
                  <div className="absolute inset-0 border-4 border-yellow-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fa-solid fa-hourglass-half text-2xl md:text-3xl text-yellow-500 animate-pulse"></i>
                  </div>
               </div>
               <h3 className="text-white text-xl md:text-2xl font-black uppercase tracking-widest mb-2 italic">{t.newMissionsIncoming}</h3>
               <p className="text-gray-500 text-[11px] md:text-sm mb-6 md:mb-8 max-w-xs">{t.regenerating}</p>
               <div className="px-8 py-3 md:px-10 md:py-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 mb-8">
                  <span className="text-3xl md:text-4xl font-mono font-black text-yellow-500 tracking-widest">
                    {formatTime(cooldownTime)}
                  </span>
               </div>
               
               <button 
                  onClick={onWatchCooldownAd}
                  className="px-6 py-3 md:px-8 md:py-4 binance-bg-yellow text-black font-black text-xs md:text-sm uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-3"
               >
                  <i className="fa-solid fa-play"></i> {t.watchToSkip}
               </button>
            </div>
          ) : (
            quests.map((q) => {
              const isCompleted = q.current >= q.target;
              const progressPct = Math.min(100, (q.current / q.target) * 100);
              
              return (
                <div 
                  key={q.id}
                  className={`p-3 md:p-4 rounded-xl border transition-all ${
                    q.isClaimed 
                    ? 'bg-[#161a1e]/50 border-gray-800 opacity-60' 
                    : isCompleted 
                      ? 'bg-yellow-500/5 border-yellow-500/30' 
                      : 'bg-[#2b3139]/30 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2 md:mb-3">
                    <div className="flex-1 pr-2">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className={`font-bold text-[11px] md:text-sm uppercase tracking-tight ${q.isClaimed ? 'text-gray-500 line-through' : 'text-white'}`}>
                          {q.title}
                        </h3>
                        {isCompleted && !q.isClaimed && (
                          <span className="text-[7px] md:text-[8px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded font-black uppercase">{t.ready}</span>
                        )}
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-500 line-clamp-2">{q.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[7px] md:text-[8px] text-gray-500 font-bold uppercase block tracking-tighter mb-0.5 md:mb-1">{t.reward}</span>
                      <span className="text-xs md:text-sm font-mono text-yellow-500 font-bold">+${q.reward.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mb-3 md:mb-4">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[8px] md:text-[10px] font-mono text-gray-400">
                        {q.current.toLocaleString(undefined, { maximumFractionDigits: 0 })} / {q.target.toLocaleString()}
                      </span>
                      <span className="text-[8px] md:text-[10px] font-mono text-gray-600">{Math.floor(progressPct)}%</span>
                    </div>
                    <div className="h-1 md:h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${isCompleted ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-yellow-500'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {!q.isClaimed && (
                    <div className="flex gap-2">
                      <button
                        disabled={!isCompleted}
                        onClick={() => onClaim(q.id)}
                        className={`flex-1 py-2 md:py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
                          isCompleted 
                          ? 'binance-bg-yellow text-black active:scale-95 shadow-lg shadow-yellow-500/10' 
                          : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {isCompleted ? t.claimReward : t.inProgress}
                      </button>
                      {!isCompleted && (
                        <button
                          onClick={() => onWatchAd(q.id)}
                          className="px-2.5 py-2 md:px-4 md:py-2.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest active:bg-blue-600/30 transition-all flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-play"></i> {t.skipNoReward.split(' ')[0]}
                        </button>
                      )}
                    </div>
                  )}
                  {q.isClaimed && (
                    <div className="w-full py-2 md:py-2.5 rounded-lg border border-gray-800 text-[9px] md:text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                      <i className="fa-solid fa-check-circle"></i> {t.claimed}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
      `}</style>
    </div>
  );
};

export default TasksPanel;
