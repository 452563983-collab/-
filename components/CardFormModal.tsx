import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, Save } from 'lucide-react';
import { CardTransaction } from '../types';

interface CardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Omit<CardTransaction, 'id' | 'createdAt'>) => void;
  initialData?: CardTransaction | null;
}

export const CardFormModal: React.FC<CardFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [setOrSeries, setSetOrSeries] = useState('');
  const [notes, setNotes] = useState('');
  const [buyPrice, setBuyPrice] = useState<string>('');
  const [buyDate, setBuyDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSold, setIsSold] = useState(false);
  const [sellPrice, setSellPrice] = useState<string>('');
  const [sellDate, setSellDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setSetOrSeries(initialData.setOrSeries);
        setNotes(initialData.notes);
        setBuyPrice(initialData.buyPrice.toString());
        setBuyDate(initialData.buyDate);
        setIsSold(initialData.isSold);
        setSellPrice(initialData.sellPrice ? initialData.sellPrice.toString() : '');
        setSellDate(initialData.sellDate || new Date().toISOString().split('T')[0]);
        setImageUrl(initialData.imageUrl);
      } else {
        // Reset form
        setName('');
        setSetOrSeries('');
        setNotes('');
        setBuyPrice('');
        setBuyDate(new Date().toISOString().split('T')[0]);
        setIsSold(false);
        setSellPrice('');
        setSellDate(new Date().toISOString().split('T')[0]);
        setImageUrl(null);
      }
    }
  }, [isOpen, initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      setOrSeries,
      notes,
      buyPrice: parseFloat(buyPrice) || 0,
      buyDate,
      isSold,
      sellPrice: isSold ? parseFloat(sellPrice) || 0 : null,
      sellDate: isSold ? sellDate : null,
      imageUrl
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            {initialData ? '编辑交易' : '新增卡牌买入'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Image Upload */}
            <div className="w-full md:w-1/3 flex flex-col gap-3">
              <label className="text-sm font-medium text-slate-300">卡牌图片</label>
              <div 
                className="relative aspect-[3/4] rounded-xl bg-slate-800 border-2 border-dashed border-slate-600 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-all group"
                onClick={() => fileInputRef.current?.click()}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="mx-auto text-slate-500 group-hover:text-indigo-400 mb-2" size={24} />
                    <span className="text-xs text-slate-500 group-hover:text-indigo-400">点击上传图片</span>
                  </div>
                )}
                {imageUrl && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-sm font-medium">更换图片</span>
                  </div>
                )}
              </div>
              {imageUrl && (
                 <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); setImageUrl(null); }}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center justify-center gap-1"
                >
                  <Trash2 size={12} /> 移除图片
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Right: Inputs */}
            <form id="cardForm" onSubmit={handleSubmit} className="w-full md:w-2/3 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">卡牌名称</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：喷火龙 初版"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">系列 / 版本</label>
                  <input
                    type="text"
                    value={setOrSeries}
                    onChange={(e) => setSetOrSeries(e.target.value)}
                    placeholder="例如：1999 宝可梦游戏王"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">买入价格 (¥)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">买入日期</label>
                    <input
                      required
                      type="date"
                      value={buyDate}
                      onChange={(e) => setBuyDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="isSold"
                      checked={isSold}
                      onChange={(e) => setIsSold(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                    />
                    <label htmlFor="isSold" className="text-sm font-semibold text-white select-none cursor-pointer">
                      标记为已卖出
                    </label>
                  </div>

                  {isSold && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div>
                        <label className="block text-sm font-medium text-emerald-400 mb-1">卖出价格 (¥)</label>
                        <input
                          required={isSold}
                          type="number"
                          min="0"
                          step="0.01"
                          value={sellPrice}
                          onChange={(e) => setSellPrice(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-400 mb-1">卖出日期</label>
                        <input
                          required={isSold}
                          type="date"
                          value={sellDate}
                          onChange={(e) => setSellDate(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                 <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">备注</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="品相，评分，其他细节..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 rounded-b-2xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-300 font-medium hover:bg-slate-800 transition-colors"
          >
            取消
          </button>
          <button 
            type="submit" 
            form="cardForm"
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Save size={18} />
            {initialData ? '更新卡牌' : '保存交易'}
          </button>
        </div>
      </div>
    </div>
  );
};