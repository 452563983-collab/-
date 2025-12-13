import React, { useMemo, useState } from 'react';
import { CardTransaction, DateRangeFilter } from '../types';
import { StatsCard } from './StatsCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, Layers, TrendingUp, Percent, Package, CalendarRange } from 'lucide-react';

interface DashboardViewProps {
  cards: CardTransaction[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ cards }) => {
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Filter cards based on date range
  const filteredCards = useMemo(() => {
    const now = new Date();
    // Normalize "now" to end of day for inclusive comparison if needed, 
    // but usually strictly time based. Let's stick to date comparisons.
    
    let start = new Date(0); // Epoch
    let end = new Date(); // Now

    switch (dateFilter) {
      case '7days':
        start.setDate(now.getDate() - 7);
        break;
      case '30days':
        start.setDate(now.getDate() - 30);
        break;
      case '90days':
        start.setDate(now.getDate() - 90);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of prev month
        break;
      case 'custom':
        if (customStart) start = new Date(customStart);
        if (customEnd) end = new Date(customEnd);
        // Adjust end date to include the full day
        end.setHours(23, 59, 59, 999);
        break;
      case 'all':
      default:
        break;
    }

    return cards.filter(c => {
      const buyDate = new Date(c.buyDate);
      const sellDate = c.sellDate ? new Date(c.sellDate) : null;
      
      // Logic: Include transaction if Buy Date OR Sell Date falls within the range
      const buyInRange = buyDate >= start && buyDate <= end;
      const sellInRange = sellDate && sellDate >= start && sellDate <= end;
      
      return buyInRange || sellInRange;
    });
  }, [cards, dateFilter, customStart, customEnd]);

  // Calculate Stats
  const stats = useMemo(() => {
    let totalInvested = 0;
    let totalSoldVal = 0;
    let soldCostBasis = 0;
    let soldCount = 0;
    let unsoldValue = 0;

    filteredCards.forEach(c => {
      // For investment stat in this period:
      // We sum up buyPrice if it's in the list (filtered by range)
      totalInvested += c.buyPrice;
      
      if (c.isSold) {
        if (c.sellPrice) {
          totalSoldVal += c.sellPrice;
          soldCostBasis += c.buyPrice;
          soldCount++;
        }
      } else {
        unsoldValue += c.buyPrice;
      }
    });

    const netProfit = totalSoldVal - soldCostBasis;
    const roi = soldCostBasis > 0 ? (netProfit / soldCostBasis) * 100 : 0;

    return {
      totalInvested,
      totalSoldVal,
      netProfit,
      roi,
      totalCards: filteredCards.length,
      soldCount,
      unsoldValue
    };
  }, [filteredCards]);

  // Prepare Chart Data (Cumulative Profit Over Time)
  const chartData = useMemo(() => {
    const timeline = new Map<string, { profit: number, sales: number }>();
    
    // Sort transactions by date
    const soldCards = filteredCards.filter(c => c.isSold && c.sellDate && c.sellPrice).sort((a, b) => 
      new Date(a.sellDate!).getTime() - new Date(b.sellDate!).getTime()
    );

    let runningProfit = 0;
    let runningSales = 0;

    soldCards.forEach(c => {
      const date = c.sellDate!;
      const profit = (c.sellPrice || 0) - c.buyPrice;
      
      runningProfit += profit;
      runningSales += c.sellPrice || 0;
      
      timeline.set(date, { profit: runningProfit, sales: runningSales });
    });

    return Array.from(timeline.entries()).map(([date, data]) => ({
      date,
      profit: data.profit,
      sales: data.sales
    }));
  }, [filteredCards]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Date Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-800/50">
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 mr-2 animate-in fade-in slide-in-from-right-5">
            <input 
              type="date" 
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded px-2 py-1.5 focus:ring-indigo-500"
            />
            <span className="text-slate-500">-</span>
            <input 
              type="date" 
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded px-2 py-1.5 focus:ring-indigo-500"
            />
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <CalendarRange className="text-slate-400" size={16} />
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateRangeFilter)}
            className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
          >
            <option value="all">全部时间</option>
            <option value="7days">最近 7 天</option>
            <option value="30days">最近 30 天</option>
            <option value="90days">最近 90 天</option>
            <option value="thisMonth">本月</option>
            <option value="lastMonth">上月</option>
            <option value="year">最近一年</option>
            <option value="custom">自定义范围...</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatsCard 
          title="总投入成本" 
          value={`¥${stats.totalInvested.toLocaleString()}`} 
          type="info"
          icon={DollarSign}
        />
        <StatsCard 
          title="库存总价值" 
          value={`¥${stats.unsoldValue.toLocaleString()}`} 
          type="info"
          icon={Package}
        />
        <StatsCard 
          title="已实现利润" 
          value={`¥${stats.netProfit.toLocaleString()}`} 
          type={stats.netProfit >= 0 ? "positive" : "negative"}
          icon={TrendingUp}
        />
        <StatsCard 
          title="投资回报率 (已售)" 
          value={`${stats.roi.toFixed(2)}%`} 
          type={stats.roi >= 0 ? "positive" : "negative"}
          icon={Percent}
        />
        <StatsCard 
          title="已售出数量" 
          value={stats.soldCount.toString()} 
          type="neutral"
          icon={Layers}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Profit Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-6">累计利润趋势</h3>
          <div className="h-64">
             {chartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString('zh-CN', {month:'short', day:'numeric'})}
                  />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `¥${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                    formatter={(val: number) => [`¥${val.toFixed(2)}`, '利润']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('zh-CN')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorProfit)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  此期间暂无销售数据
                </div>
             )}
          </div>
        </div>

        {/* Invested vs Sold Breakdown (Mock for visual balance if no data, or real data) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
           <h3 className="text-lg font-bold text-white mb-6">资金流向分析</h3>
           <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{
                name: '概览',
                invested: stats.totalInvested,
                sold: stats.totalSoldVal,
                unsold: stats.unsoldValue
              }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" hide />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `¥${val}`} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
                <Legend />
                <Bar name="总投入成本" dataKey="invested" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar name="库存价值" dataKey="unsold" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar name="总销售收入" dataKey="sold" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};