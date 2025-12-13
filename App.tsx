import React, { useState, useEffect, useRef } from 'react';
import { CardTransaction, ViewMode } from './types';
import { LayoutDashboard, WalletCards, Plus, Download, Upload, Settings, MoreHorizontal } from 'lucide-react';
import { CardFormModal } from './components/CardFormModal';
import { InventoryView } from './components/InventoryView';
import { DashboardView } from './components/DashboardView';

const LOCAL_STORAGE_KEY = 'card_flip_data_v1';

function App() {
  const [cards, setCards] = useState<CardTransaction[]>([]);
  const [view, setView] = useState<ViewMode>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardTransaction | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setCards(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  const handleSaveCard = (cardData: Omit<CardTransaction, 'id' | 'createdAt'>) => {
    if (editingCard) {
      // Update existing
      setCards(prev => prev.map(c => c.id === editingCard.id ? { ...c, ...cardData } : c));
    } else {
      // Create new
      const newCard: CardTransaction = {
        ...cardData,
        id: crypto.randomUUID(),
        createdAt: Date.now()
      };
      setCards(prev => [newCard, ...prev]);
    }
    setEditingCard(null);
  };

  const handleDeleteCard = (id: string) => {
    if (window.confirm("确定要删除这条记录吗？")) {
      setCards(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleBulkDelete = (ids: string[]) => {
    if (window.confirm(`确定要删除选中的 ${ids.length} 张卡牌吗？`)) {
      setCards(prev => prev.filter(c => !ids.includes(c.id)));
    }
  };

  const openAddModal = () => {
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const openEditModal = (card: CardTransaction) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  // --- Data Management ---
  const handleExportData = () => {
    const dataStr = JSON.stringify(cards, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `card_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
    setShowMenu(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const data = JSON.parse(result);
        
        if (Array.isArray(data)) {
          if (window.confirm(`找到 ${data.length} 条记录。导入将覆盖当前所有数据，确定吗？`)) {
            setCards(data);
            alert("数据导入成功！");
          }
        } else {
          alert("文件格式不正确。");
        }
      } catch (err) {
        console.error(err);
        alert("无效的备份文件。");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />

      {/* Top Mobile Bar (Minimal) */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 pt-safe-top">
        <div className="flex justify-between items-center px-4 h-14">
            <h1 className="text-lg font-bold text-white">
              {view === 'dashboard' ? '投资概览' : '卡牌库存'}
            </h1>

            {/* Settings/Menu Button */}
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 -mr-2 text-slate-400 hover:text-white active:bg-slate-800 rounded-full transition-colors"
              >
                <Settings size={22} />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-20 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-900 border-b border-slate-800">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">数据管理</p>
                    </div>
                    <button 
                      onClick={handleExportData}
                      className="w-full flex items-center gap-3 px-4 py-4 text-sm text-slate-300 active:bg-slate-800 text-left transition-colors"
                    >
                      <Download size={18} />
                      <div>
                        <div className="font-medium text-white">备份数据</div>
                        <div className="text-xs text-slate-500">导出 JSON 文件</div>
                      </div>
                    </button>
                    <button 
                      onClick={handleImportClick}
                      className="w-full flex items-center gap-3 px-4 py-4 text-sm text-slate-300 active:bg-slate-800 text-left transition-colors border-t border-slate-800/50"
                    >
                      <Upload size={18} />
                      <div>
                        <div className="font-medium text-white">恢复数据</div>
                        <div className="text-xs text-slate-500">导入 JSON 文件</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      {/* pb-24 ensures content isn't hidden behind the bottom nav */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-4 pb-28 overflow-y-auto">
        {view === 'dashboard' ? (
          <DashboardView cards={cards} />
        ) : (
          <InventoryView 
            cards={cards} 
            onEdit={openEditModal} 
            onDelete={handleDeleteCard} 
            onBulkDelete={handleBulkDelete}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 pb-safe-bottom z-40">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto relative">
          
          {/* Dashboard Tab */}
          <button
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center justify-center w-20 space-y-1 ${
              view === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard size={24} strokeWidth={view === 'dashboard' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">概览</span>
          </button>

          {/* Center Floating Action Button (FAB) */}
          <div className="relative -top-6">
             <button
               onClick={openAddModal}
               className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-600/40 border-4 border-slate-950 active:scale-95 transition-transform"
             >
               <Plus size={30} strokeWidth={3} />
             </button>
          </div>

          {/* Inventory Tab */}
          <button
            onClick={() => setView('inventory')}
            className={`flex flex-col items-center justify-center w-20 space-y-1 ${
              view === 'inventory' ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <WalletCards size={24} strokeWidth={view === 'inventory' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">库存</span>
          </button>

        </div>
      </nav>

      {/* Modals */}
      <CardFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveCard}
        initialData={editingCard}
      />
    </div>
  );
}

export default App;