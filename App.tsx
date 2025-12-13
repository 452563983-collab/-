import React, { useState, useEffect } from 'react';
import { CardTransaction, ViewMode } from './types';
import { LayoutDashboard, WalletCards, Plus } from 'lucide-react';
import { CardFormModal } from './components/CardFormModal';
import { InventoryView } from './components/InventoryView';
import { DashboardView } from './components/DashboardView';

const LOCAL_STORAGE_KEY = 'card_flip_data_v1';

function App() {
  const [cards, setCards] = useState<CardTransaction[]>([]);
  const [view, setView] = useState<ViewMode>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardTransaction | null>(null);

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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
               <div className="bg-indigo-600 p-2 rounded-lg">
                 <WalletCards className="text-white" size={24} />
               </div>
               <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hidden sm:block">
                 卡牌交易助手
               </h1>
            </div>

            <nav className="flex space-x-1 sm:space-x-4">
              <button
                onClick={() => setView('dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'dashboard' 
                    ? 'bg-indigo-500/10 text-indigo-400' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard size={18} />
                <span>仪表盘</span>
              </button>
              <button
                onClick={() => setView('inventory')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'inventory' 
                    ? 'bg-indigo-500/10 text-indigo-400' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <WalletCards size={18} />
                <span>库存管理</span>
              </button>
            </nav>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">添加卡牌</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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