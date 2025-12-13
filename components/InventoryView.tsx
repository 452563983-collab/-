import React, { useState, useEffect, useMemo } from 'react';
import { CardTransaction } from '../types';
import { Search, Edit2, Trash2, Calendar, TrendingUp, CheckSquare, Square, X, ArrowUpDown, Tag, WalletCards } from 'lucide-react';

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

  // Clear selection if filter changes
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

  const handleBulkDeleteClick = () => {
    if (selectedIds.size === 0) return;
    onBulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  return (
    <div className="space-y-4">
      {/* Mobile Toolbar */}
      <div className="sticky top-0 z-20 bg-slate-950 py-2 space-y-3">
        {/* Search Bar */}
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="搜索名称..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
        </div>

        {/* Filters & Actions Row */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex gap-2">
            {(['all', 'owned', 'sold'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                  filter === f 
                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {f === 'all' ? '全部' : f === 'owned' ? '持仓' : '已售'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
             {isSelectionMode ? (
               <button 
                onClick={handleBulkDeleteClick}
                disabled={selectedIds.size === 0}
                className="text-xs font-bold text-rose-400 bg-rose-400/10 px-3 py-1.5 rounded-full disabled:opacity-50"
               >
                 删除({selectedIds.size})
               </button>
             ) : (
                <button 
                  onClick={() => setIsSelectionMode(true)}
                  className="p-1.5 text-slate-400 bg-slate-900 border border-slate-800 rounded-lg"
                >
                  <CheckSquare size={18} />
                </button>
             )}
             
             {isSelectionMode && (
                <button onClick={() => setIsSelectionMode(false)} className="text-slate-400 px-2">
                   取消
                </button>
             )}
          </div>
        </div>
      </div>

      {/* Card List (Mobile First - Single Column) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <div className="inline-block p-4 rounded-full bg-slate-900 mb-4">
              <Search size={32} className="text-slate-600" />
            </div>
            <p className="text-slate-500">没找到相关卡牌</p>
          </div>
        ) : (
          filteredCards.map(card => {
            const isSelected = selectedIds.has(card.id);
            const profit = card.sellPrice ? card.sellPrice - card.buyPrice : 0;
            
            return (
            <div 
              key={card.id} 
              className={`bg-slate-900 rounded-xl overflow-hidden border shadow-sm relative ${
                isSelected ? 'border-indigo-500 bg-indigo-900/10' : 'border-slate-800'
              }`}
              onClick={() => isSelectionMode && toggleSelection(card.id)}
            >
               {/* Selection Overlay */}
               {isSelectionMode && (
                  <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'bg-indigo-500 border-indigo-500' 
                        : 'bg-black/40 border-white/60'
                    }`}>
                       {isSelected && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />}
                    </div>
                  </div>
                )}

              <div className="flex sm:flex-col">
                {/* Image Section - Left on Mobile, Top on Desktop */}
                <div className="w-28 sm:w-full h-28 sm:h-48 shrink-0 bg-slate-950 relative">
                   {card.imageUrl ? (
                     <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover sm:object-contain" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <WalletCards size={24} />
                     </div>
                   )}
                   {/* Status Badge */}
                   <div className={`absolute bottom-0 left-0 right-0 py-0.5 text-[10px] font-bold text-center uppercase tracking-widest ${
                      card.isSold ? 'bg-emerald-500/90 text-white' : 'bg-indigo-500/90 text-white'
                   }`}>
                      {card.isSold ? 'SOLD' : 'HOLDING'}
                   </div>
                </div>

                {/* Details Section */}
                <div className="flex-1 p-3 flex flex-col justify-between">
                   <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-slate-100 leading-tight line-clamp-2 text-sm">{card.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{card.setOrSeries || '未分类'}</p>
                      
                      <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-xs">
                         <div className="text-slate-400">买入:</div>
                         <div className="text-right font-mono text-slate-200">¥{card.buyPrice.toLocaleString()}</div>
                         
                         {card.isSold ? (
                           <>
                             <div className="text-emerald-400">卖出:</div>
                             <div className="text-right font-mono text-emerald-400 font-bold">¥{card.sellPrice?.toLocaleString()}</div>
                           </>
                         ) : (
                           <>
                             <div className="text-slate-500">日期:</div>
                             <div className="text-right text-slate-500 scale-90 origin-right">{card.buyDate}</div>
                           </>
                         )}
                      </div>
                   </div>
                   
                   {!isSelectionMode && (
                    <div className="flex justify-end gap-3 mt-3 pt-2 border-t border-slate-800/50">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(card); }}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                   )}
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