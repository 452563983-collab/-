import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign, Activity } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  trend?: number; // percentage
  type?: 'neutral' | 'positive' | 'negative' | 'info';
  icon?: React.ElementType;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  trend, 
  type = 'neutral',
  icon: Icon = Activity
}) => {
  const getColors = () => {
    switch (type) {
      case 'positive': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'negative': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'info': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const colorClass = getColors();

  return (
    <div className={`p-5 rounded-xl border border-slate-800 bg-slate-900 shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        {trend !== undefined && (
          <div className={`flex items-center text-xs font-semibold ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend >= 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
};