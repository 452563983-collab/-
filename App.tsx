import React, { useState, useEffect, useRef } from 'react';
import { CardTransaction, ViewMode } from './types';
import { LayoutDashboard, WalletCards, Plus, Download, Upload, Settings, Loader2, BookOpen, Info } from 'lucide-react';
import { CardFormModal } from './components/CardFormModal';
import { InventoryView } from './components/InventoryView';
import { DashboardView } from './components/DashboardView';
import { loadCardsFromDB, saveCardToDB, deleteCardFromDB, bulkDeleteFromDB, bulkSaveCardsToDB } from './utils/db';

function App() {
  const [cards, setCards] = useState<CardTransaction[]>([]);
  const [view, setView] = useState<ViewMode>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardTransaction | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        const data = await loadCardsFromDB();
        setCards(data);
      } catch (e) {
        console.error("Failed to load data from DB", e);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  const handleSaveCard = async (cardData: Omit<CardTransaction, 'id' | 'createdAt'>) => {
    let updatedCard: CardTransaction;

    if (editingCard) {
      updatedCard = { ...editingCard, ...cardData };
      setCards(prev => prev.map(c => c.id === editingCard.id ? updatedCard : c));
    } else {
      updatedCard = {
        ...cardData,
        id: crypto.randomUUID(),
        createdAt: Date.now()
      };
      setCards(prev => [updatedCard, ...prev]);
    }

    await saveCardToDB(updatedCard);
    setEditingCard(null);
  };

  const handleDeleteCard = async (id: string) => {
    if (window.confirm("确定要删除这条记录吗？")) {
      setCards(prev => prev.filter(c => c.id !== id));
      await deleteCardFromDB(id);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (window.confirm(`确定要删除选中的 ${ids.length} 张卡牌吗？`)) {
      setCards(prev => prev.filter(c => !ids.includes(c.id)));
      await bulkDeleteFromDB(ids);
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
    reader.onload = async (event) => {
      try {
        const result = event.target?.result as string;
        const data = JSON.parse(result);
        
        if (Array.isArray(data)) {
          if (window.confirm(`找到 ${data.length} 条记录。导入将覆盖当前所有数据，确定吗？`)) {
            setIsLoading(true);
            await bulkSaveCardsToDB(data);
            setCards(data);
            alert("数据导入成功！");
          }
        } else {
          alert("文件格式不正确。");
        }
      } catch (err) {
        console.error(err);
        alert("无效的备份文件或数据库错误。");
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>正在加载数据库...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />

      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 pt-safe-top">
        <div className="flex justify-between items-center px-4 h-14">
            <h1 className="text-lg font-bold text-white">
              {view === 'dashboard' ? '投资概览' : '卡牌库存'}
            </h1>

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
                  <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-20 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-900 border-b border-slate-800">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">工具与设置</p>
                    </div>
                    <button 
                      onClick={() => { setShowHelp(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 active:bg-slate-800 text-left transition-colors"
                    >
                      <BookOpen size={18} className="text-indigo-400" />
                      <div>
                        <div className="font-medium text-white">部署指南</div>
                        <div className="text-[10px] text-slate-500">如何在 Halo/NAS 上托管</div>
                      </div>
                    </button>
                    <button 
                      onClick={handleExportData}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 active:bg-slate-800 text-left transition-colors border-t border-slate-800/50"
                    >
                      <Download size={18} />
                      <div>
                        <div className="font-medium text-white">备份数据</div>
                        <div className="text-[10px] text-slate-500">导出 JSON 文件</div>
                      </div>
                    </button>
                    <button 
                      onClick={handleImportClick}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 active:bg-slate-800 text-left transition-colors border-t border-slate-800/50"
                    >
                      <Upload size={18} />
                      <div>
                        <div className="font-medium text-white">恢复数据</div>
                        <div className="text-[10px] text-slate-500">从备份恢复</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
        </div>
      </header>

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

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 pb-safe-bottom z-40">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto relative">
          <button
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center justify-center w-20 space-y-1 ${
              view === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard size={24} strokeWidth={view === 'dashboard' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">概览</span>
          </button>

          <div className="relative -top-6">
             <button
               onClick={openAddModal}
               className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-600/40 border-4 border-slate-950 active:scale-95 transition-transform"
             >
               <Plus size={30} strokeWidth={3} />
             </button>
          </div>

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

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowHelp(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Info className="text-indigo-400" /> 部署说明 (Halo/NAS)
            </h2>
            <div className="space-y-4 text-sm text-slate-300">
              <section>
                <h3 className="font-bold text-indigo-400 mb-1">1. 打包</h3>
                <p>在终端运行 <code>npm run build</code> 生成 <code>dist</code> 文件夹。</p>
              </section>
              <section>
                <h3 className="font-bold text-indigo-400 mb-1">2. 托管</h3>
                <p>将 <code>dist</code> 文件夹内容上传到 NAS 或服务器。如果是 Halo 用户，可以放在服务器的 <code>static/cards</code> 目录下。</p>
              </section>
              <section>
                <h3 className="font-bold text-indigo-400 mb-1">3. Halo 链接</h3>
                <p>在 Halo 后台“菜单”中添加一个“外部链接”，指向你的托管路径（如 <code>/cards</code>）。</p>
              </section>
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-200">
                提示：本应用是纯静态的，所有数据都存储在你的浏览器 IndexedDB 中。更换设备时请使用顶部的“备份”和“恢复”功能。
              </div>
            </div>
            <button 
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}

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