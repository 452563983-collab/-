import React, { useState, useEffect, useMemo } from 'react';
import { CardTransaction } from '../types';
import { Search, Edit2, Trash2, Calendar, TrendingUp, CheckSquare, Square, X, ArrowUpDown } from 'lucide-react';

interface InventoryViewProps {
  cards: CardTransaction[];
  onEdit: (card: CardTransaction) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
}

type SortOption = 'created_desc' | 'buyDate_desc' | 'buyDate_asc' | 'price_desc' | 'price_asc';

export const InventoryView: React.FC<InventoryViewProps> = ({ cards, onEdit, onDelete, onBulkDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'owned' | 'sold'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('created_desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Filter and Sort
  const filteredCards = useMemo(() => {
    let result = cards.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           card.setOrSeries.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      
      if (filter === 'owned') return !card.isSold;
      if (filter === 'sold') return card.isSold;
      return true;
    });

    // Apply Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'buyDate_desc':
          return new Date(b.buyDate).getTime() - new Date(a.buyDate).getTime();
        case 'buyDate_asc':
          return new Date(a.buyDate).getTime() - new Date(b.buyDate).getTime();
        case 'price_desc':
          return b.buyPrice - a.buyPrice;
        case 'price_asc':
          return a.buyPrice - b.buyPrice;
        case 'created_desc':
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return result;
  }, [cards, searchTerm, filter, sortOption]);

  // Clear selection if filter changes to avoid confusion
  useEffect(() => {
    setSelectedIds(new Set());
  }, [filter, searchTerm]);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredCards.length && filteredCards.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCards.map(c => c.id)));
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.size === 0) return;
    onBulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const getFilterLabel = (f: string) => {
    switch(f) {
      case 'all': return '全部';
      case 'owned': return '持有中';
      case 'sold': return '已卖出';
      default: return f;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar / Filters */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-start sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="搜索卡牌名称或系列..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
            {(['all', 'owned', 'sold'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === f 
                    ? 'bg-slate-700 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {getFilterLabel(f)}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
            <ArrowUpDown size={16} className="text-slate-500" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-transparent text-sm text-slate-300 focus:outline-none border-none cursor-pointer"
            >
              <option value="created_desc">最新添加</option>
              <option value="buyDate_desc">买入日期 (近-远)</option>
              <option value="buyDate_asc">买入日期 (远-近)</option>
              <option value="price_desc">买入价格 (高-低)</option>
              <option value="price_asc">买入价格 (低-高)</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex gap-2 w-full xl:w-auto justify-end">
           {selectedIds.size > 0 ? (
             <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-200">
                <span className="text-slate-400 text-sm hidden sm:inline">已选中 {selectedIds.size} 项</span>
                <button
                  onClick={handleBulkDeleteClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-500 shadow-lg shadow-rose-500/20"
                >
                  <Trash2 size={16} />
                  删除选中
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  title="取消选择"
                >
                  <X size={18} />
                </button>
             </div>
           ) : (
             <button
               onClick={() => setIsSelectionMode(!isSelectionMode)}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                 isSelectionMode 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
               }`}
             >
               <CheckSquare size={16} />
               {isSelectionMode ? '退出选择' : '批量管理'}
             </button>
           )}
        </div>
      </div>
      
      {/* Select All Bar (only visible in selection mode) */}
      {isSelectionMode && filteredCards.length > 0 && (
        <div className="flex items-center gap-3 px-1">
           <button 
             onClick={toggleAll}
             className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
           >
              {selectedIds.size === filteredCards.length && filteredCards.length > 0 ? (
                <CheckSquare size={18} className="text-indigo-500" />
              ) : (
                <Square size={18} className="text-slate-500" />
              )}
              全选当前列表
           </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCards.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="inline-block p-4 rounded-full bg-slate-800/50 mb-4">
              <Search size={32} className="text-slate-500" />
            </div>
            <p className="text-slate-400 text-lg">未找到符合条件的卡牌。</p>
          </div>
        ) : (
          filteredCards.map(card => {
            const isSelected = selectedIds.has(card.id);
            return (
            <div 
              key={card.id} 
              className={`group relative bg-slate-900 border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col ${
                isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              
              {/* Image Area */}
              <div 
                className="relative aspect-[4/3] overflow-hidden bg-slate-950 cursor-pointer"
                onClick={() => {
                  if (isSelectionMode) {
                    toggleSelection(card.id);
                  }
                }}
              >
                {/* Selection Checkbox Overlay */}
                {isSelectionMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-600' 
                        : 'bg-black/40 border-white/50 hover:bg-black/60'
                    }`}>
                       {isSelected && <div className="w-2.5 h-4 border-r-2 border-b-2 border-white rotate-45 -translate-y-0.5" />}
                    </div>
                  </div>
                )}

                {card.imageUrl ? (
                  <img src={card.imageUrl} alt={card.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs">无图片</div>
                )}
                
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                  card.isSold ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                }`}>
                  {card.isSold ? '已卖出' : '持有中'}
                </div>
              </div>

              {/* Info Area */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg leading-tight mb-1 truncate" title={card.name}>{card.name}</h3>
                  <p className="text-slate-500 text-sm mb-4 truncate">{card.setOrSeries}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-1">
                      <p className="text-slate-500 text-xs flex items-center gap-1"><Calendar size={10} /> 买入</p>
                      <p className="text-white font-mono">¥{card.buyPrice.toFixed(2)}</p>
                      <p className="text-slate-600 text-[10px]">{card.buyDate}</p>
                    </div>
                    {card.isSold && (
                      <div className="space-y-1 text-right">
                        <p className="text-emerald-500/70 text-xs flex items-center gap-1 justify-end"><TrendingUp size={10} /> 卖出</p>
                        <p className="text-emerald-400 font-mono font-bold">¥{card.sellPrice?.toFixed(2)}</p>
                        <p className="text-slate-600 text-[10px]">{card.sellDate}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profit bar for sold items */}
                {card.isSold && card.sellPrice && (
                  <div className="mt-4 pt-3 border-t border-slate-800">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">利润:</span>
                        <span className={`font-mono font-bold ${(card.sellPrice - card.buyPrice) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {(card.sellPrice - card.buyPrice) > 0 ? '+' : ''}¥{(card.sellPrice - card.buyPrice).toFixed(2)}
                        </span>
                     </div>
                  </div>
                )}
                
                {/* Action Buttons (Always visible footer) */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
                   <button 
                      onClick={(e) => { e.stopPropagation(); onEdit(card); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-indigo-400 hover:bg-slate-700 hover:text-indigo-300 transition-colors"
                    >
                      <Edit2 size={14} /> 编辑
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-rose-400 hover:bg-slate-700 hover:text-rose-300 transition-colors"
                    >
                      <Trash2 size={14} /> 删除
                    </button>
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
};