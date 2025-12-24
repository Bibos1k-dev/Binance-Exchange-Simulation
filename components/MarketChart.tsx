
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  BarChart, 
  Bar, 
  Cell, 
  LineChart, 
  Line
} from 'recharts';
import { PriceData } from '../types';
import { Language, translations } from '../locales';

interface MarketChartProps {
  data: PriceData[];
  assetName?: string;
  assetCode?: string;
  lang: Language;
}

type ChartType = 'price' | 'depth' | 'info';
type VisualizationType = 'Area' | 'Line' | 'Bars';

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

const TradingBar = (props: any) => {
  const { x, y, width, height, open, close, high, low, fill } = props;
  const centerX = x + width / 2;
  const bodyWidth = Math.max(2, width * 0.7);
  const ratio = height / Math.max(0.000001, high - low);
  const bodyTop = y + (high - Math.max(open, close)) * ratio;
  const bodyBottom = y + (high - Math.min(open, close)) * ratio;
  const bodyHeight = Math.max(1, bodyBottom - bodyTop);

  return (
    <g style={{ shapeRendering: 'crispEdges' }}>
      <line x1={centerX} y1={y} x2={centerX} y2={y + height} stroke={fill} strokeWidth={1.5} />
      <rect 
        x={centerX - bodyWidth / 2} 
        y={bodyTop} 
        width={bodyWidth} 
        height={bodyHeight} 
        fill={fill} 
        stroke={fill} 
        strokeWidth={1} 
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isUp = data.close >= data.open;
    return (
      <div className="bg-[#1e2329] border border-[#2b3139] p-2 md:p-3 rounded shadow-xl text-[10px] md:text-[11px] font-mono z-[100]">
        <div className="text-gray-500 mb-1 md:mb-2 border-b border-gray-800 pb-1">{data.time}</div>
        <div className="grid grid-cols-2 gap-x-2 md:gap-x-4 gap-y-1">
          <span className="text-gray-500">O:</span> <span className="text-white text-right">{formatPrice(data.open)}</span>
          <span className="text-gray-500">H:</span> <span className="text-white text-right">{formatPrice(data.high)}</span>
          <span className="text-gray-500">L:</span> <span className="text-white text-right">{formatPrice(data.low)}</span>
          <span className="text-gray-500">C:</span> <span className={`${isUp ? 'text-green-500' : 'text-red-500'} text-right font-bold`}>{formatPrice(data.close)}</span>
        </div>
      </div>
    );
  }
  return null;
};

const MarketChart: React.FC<MarketChartProps> = ({ data, assetName = 'Bitcoin', assetCode = 'BTC', lang }) => {
  const t = translations[lang];
  const [chartType, setChartType] = useState<ChartType>('price');
  const [visualType, setVisualType] = useState<VisualizationType>('Area');
  const [isVisualMenuOpen, setIsVisualMenuOpen] = useState(false);
  const [visiblePoints, setVisiblePoints] = useState(window.innerWidth < 768 ? 40 : 80);
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPrice = data.length > 0 ? data[data.length - 1].price : 0;
  const slicedData = useMemo(() => data.slice(-visiblePoints), [data, visiblePoints]);

  const depthData = useMemo(() => {
    if (data.length < 2) return [];
    const spread = currentPrice * 0.005;
    const bids = Array.from({ length: 20 }).map((_, i) => ({
      price: currentPrice - spread - (i * spread * 0.5),
      vol: Math.random() * 50 + (20 - i) * 10
    })).sort((a, b) => b.price - a.price);
    
    const asks = Array.from({ length: 20 }).map((_, i) => ({
      price: currentPrice + spread + (i * spread * 0.5),
      vol: Math.random() * 50 + (20 - i) * 10
    })).sort((a, b) => a.price - b.price);

    let cumBid = 0;
    const bidPoints = bids.map(b => { cumBid += b.vol; return { price: b.price, bid: cumBid }; });
    let cumAsk = 0;
    const askPoints = asks.map(a => { cumAsk += a.vol; return { price: a.price, ask: cumAsk }; });

    return [...bidPoints, ...askPoints].sort((a, b) => a.price - b.price);
  }, [currentPrice]);

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsVisualMenuOpen(false);
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (chartType !== 'price') return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 5 : -5;
    setVisiblePoints(prev => Math.max(20, Math.min(150, prev + delta)));
  }, [chartType]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const commonYAxis = (
    <YAxis 
      domain={['auto', 'auto']} 
      orientation="right" 
      axisLine={false} 
      tickLine={false} 
      tick={{ fill: '#474d57', fontSize: window.innerWidth < 768 ? 8 : 9 }}
      tickFormatter={(val) => formatPrice(val)}
      mirror={true}
      dx={-5}
    />
  );

  const commonXAxis = <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#474d57', fontSize: window.innerWidth < 768 ? 7 : 9 }} interval="preserveStartEnd" minTickGap={window.innerWidth < 768 ? 20 : 40} />;

  const renderPriceChart = () => {
    if (visualType === 'Bars') {
      const barsData = slicedData.map(d => ({ ...d, range: [d.low, d.high] }));
      return (
        <BarChart data={barsData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="1 1" stroke="#2b3139" vertical={false} strokeOpacity={0.1} />
          {commonXAxis}
          {commonYAxis}
          <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="range" shape={<TradingBar />} isAnimationActive={false}>
            {barsData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.close >= entry.open ? '#0ecb81' : '#f6465d'} />
            ))}
          </Bar>
          <ReferenceLine y={currentPrice} stroke="#f0b90b" strokeWidth={1} strokeDasharray="3 3" />
        </BarChart>
      );
    }

    if (visualType === 'Line') {
      return (
        <LineChart data={slicedData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="1 1" stroke="#2b3139" vertical={false} strokeOpacity={0.1} />
          {commonXAxis}
          {commonYAxis}
          <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          <Line type="monotone" dataKey="price" stroke="#f0b90b" strokeWidth={2} dot={false} isAnimationActive={false} />
          <ReferenceLine y={currentPrice} stroke="#f0b90b" strokeWidth={1} strokeDasharray="3 3" />
        </LineChart>
      );
    }

    return (
      <AreaChart data={slicedData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f0b90b" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#f0b90b" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="1 1" stroke="#2b3139" vertical={false} strokeOpacity={0.1} />
        {commonXAxis}
        {commonYAxis}
        <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
        <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#f0b90b" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            isAnimationActive={false} 
        />
        <ReferenceLine y={currentPrice} stroke="#f0b90b" strokeWidth={1} strokeDasharray="3 3" />
      </AreaChart>
    );
  };

  return (
    <div className="w-full h-full relative flex flex-col bg-[#0b0e11] overflow-hidden" ref={containerRef}>
      {/* Background Watermark - Adjusted for Mobile */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.06] md:opacity-[0.08]">
        <div className="flex flex-col items-center select-none transform -translate-y-4">
          <i className={`fa-solid ${ASSET_ICONS[assetCode || 'BTC'] || 'fa-coins'} text-[100px] md:text-[160px] mb-2`}></i>
          <span className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase">{assetCode}</span>
        </div>
      </div>

      <div className="absolute top-12 left-4 md:left-6 z-20 pointer-events-none">
        <div className="flex items-center gap-1.5 md:gap-2">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{assetCode} {t.online}</span>
        </div>
      </div>

      {/* Header with Tools - Fixed layout to prevent clipping */}
      <div className="h-10 border-b border-[#2b3139] flex items-center z-30 shrink-0 bg-[#161a1e]">
        {/* Scrollable Tabs */}
        <div className="flex-1 flex overflow-x-auto no-scrollbar h-full px-2 md:px-4">
          <div className="flex gap-1 h-full items-center">
            <button className={`px-3 md:px-4 h-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${chartType === 'price' ? 'binance-yellow border-yellow-500 bg-white/5' : 'text-gray-500 border-transparent hover:text-white'}`} onClick={() => setChartType('price')}>{t.chart}</button>
            <button className={`px-3 md:px-4 h-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${chartType === 'depth' ? 'binance-yellow border-yellow-500 bg-white/5' : 'text-gray-500 border-transparent hover:text-white'}`} onClick={() => setChartType('depth')}>{t.depth}</button>
            <button className={`px-3 md:px-4 h-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${chartType === 'info' ? 'binance-yellow border-yellow-500 bg-white/5' : 'text-gray-500 border-transparent hover:text-white'}`} onClick={() => setChartType('info')}>{t.info}</button>
          </div>
        </div>

        {/* Fixed Tool - Visual Type Selector */}
        {chartType === 'price' && (
          <div className="px-2 md:px-4 relative shrink-0" ref={menuRef}>
            <button 
              onClick={() => setIsVisualMenuOpen(!isVisualMenuOpen)} 
              className="w-7 h-7 md:w-8 md:h-8 rounded bg-[#2b3139] border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <i className={`fa-solid ${visualType === 'Area' ? 'fa-chart-area' : visualType === 'Bars' ? 'fa-chart-bar' : 'fa-chart-line'} text-[12px] md:text-[14px]`}></i>
            </button>
            {isVisualMenuOpen && (
              <div className="absolute top-9 right-2 md:right-4 w-32 md:w-36 bg-[#1e2329] border border-[#2b3139] rounded shadow-2xl z-[150] py-1 animate-in fade-in zoom-in-95 duration-150">
                {(['Line', 'Bars', 'Area'] as VisualizationType[]).map(type => (
                  <button 
                    key={type} 
                    onClick={() => { setVisualType(type); setIsVisualMenuOpen(false); }} 
                    className={`w-full px-3 py-2 flex items-center gap-2 text-[10px] md:text-xs hover:bg-white/5 transition-colors ${visualType === type ? 'binance-yellow' : 'text-gray-400'}`}
                  >
                    <i className={`fa-solid fa-chart-${type === 'Line' ? 'line' : type === 'Bars' ? 'bar' : 'area'} w-4`}></i> {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 relative z-10 touch-pan-x cursor-crosshair">
        {chartType === 'price' && (
          <div className="w-full h-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {renderPriceChart()}
            </ResponsiveContainer>
          </div>
        )}
        
        {chartType === 'depth' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={depthData} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" vertical={false} strokeOpacity={0.1} />
              <XAxis dataKey="price" hide />
              <YAxis hide />
              <Tooltip content={({ payload }) => payload?.[0] ? <div className="bg-[#1e2329] p-2 border border-[#2b3139] text-[9px] md:text-[10px] font-mono"><div className="text-gray-500">{t.price}: {formatPrice(payload[0].payload.price)}</div><div className={payload[0].dataKey === 'bid' ? 'text-green-500' : 'text-red-500'}>Volume: {payload[0].value?.toFixed(2)}</div></div> : null} />
              <Area type="step" dataKey="bid" stroke="#0ecb81" fill="#0ecb81" fillOpacity={0.1} isAnimationActive={false} />
              <Area type="step" dataKey="ask" stroke="#f6465d" fill="#f6465d" fillOpacity={0.1} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {chartType === 'info' && (
          <div className="p-4 md:p-8 h-full overflow-y-auto no-scrollbar">
            <h2 className="text-white font-black text-xl md:text-2xl uppercase italic tracking-tighter mb-4 md:mb-6">{assetName} ({assetCode}) Network</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {[
                { label: 'Asset Standard', val: 'Native-v1' },
                { label: 'Algorithm', val: 'Proof-of-Stake' },
                { label: 'Circulating Supply', val: '18,500,000 ' + assetCode },
                { label: 'Market Cap', val: '$' + (currentPrice * 18500000).toLocaleString() },
                { label: 'Consensus', val: 'Decentralized Core' },
                { label: 'Listing Date', val: 'Launch Day' }
              ].map((item, idx) => (
                <div key={idx} className="bg-[#1e2329] p-3 md:p-4 border border-[#2b3139] rounded-lg">
                  <div className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{item.label}</div>
                  <div className="text-white font-mono font-bold text-xs md:text-sm">{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MarketChart;
