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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content - Sheet on mobile, Centered on Desktop */}
      <div className="relative w-full sm:max-w-xl bg-slate-900 border-t sm:border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-10 duration-200">
        
        {/* Handle for mobile sheet feel */}
        <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
           <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">
            {initialData ? '编辑卡牌' : '记一笔 (买入)'}
          </h2>
          <button onClick={onClose} className="p-1 -mr-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            
            {/* Image Uploader */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-400">卡牌照片</label>
              <div 
                className={`relative w-full h-40 rounded-xl border-2 border-dashed ${imageUrl ? 'border-transparent' : 'border-slate-700'} bg-slate-800 flex flex-col items-center justify-center overflow-hidden cursor-pointer active:bg-slate-700/80 transition-all`}
                onClick={() => fileInputRef.current?.click()}
              >
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                       <span className="text-white text-xs font-bold">点击更换</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="mx-auto text-slate-500 mb-2" size={24} />
                    <span className="text-xs text-slate-500">点击上传/拍照</span>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              {imageUrl && (
                 <button type="button" onClick={() => setImageUrl(null)} className="self-end text-xs text-rose-400 flex items-center gap-1">
                   <Trash2 size={12} /> 删除照片
                 </button>
              )}
            </div>

            {/* Form Fields */}
            <form id="cardForm" onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">名称</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：青眼白龙"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">买入价</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
                        <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        value={buyPrice}
                        onChange={(e) => setBuyPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                        />
                    </div>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">买入日期</label>
                    <input
                        required
                        type="date"
                        value={buyDate}
                        onChange={(e) => setBuyDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">系列 / 版本</label>
                  <input
                    type="text"
                    value={setOrSeries}
                    onChange={(e) => setSetOrSeries(e.target.value)}
                    placeholder="例如：25周年纪念版"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Sell Section Toggle */}
                <div className="pt-4 border-t border-slate-800">
                  <div 
                    className="flex items-center justify-between py-2 cursor-pointer"
                    onClick={() => setIsSold(!isSold)}
                  >
                    <span className={`text-sm font-bold ${isSold ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {isSold ? '状态：已卖出' : '状态：持有中'}
                    </span>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isSold ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isSold ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {isSold && (
                    <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div>
                        <label className="block text-sm font-medium text-emerald-400 mb-1.5">卖出价</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/50">¥</span>
                            <input
                            required={isSold}
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={sellPrice}
                            onChange={(e) => setSellPrice(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                            />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-400 mb-1.5">卖出日期</label>
                        <input
                          required={isSold}
                          type="date"
                          value={sellDate}
                          onChange={(e) => setSellDate(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                 <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">备注</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="PSA 10, 微瑕..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                </div>
              </div>
            </form>
            
            {/* Spacer for bottom button */}
            <div className="h-16"></div>
        </div>

        {/* Footer Fixed Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800 rounded-b-2xl pb-safe-bottom">
          <button 
            type="submit" 
            form="cardForm"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20"
          >
            <Save size={20} />
            {initialData ? '更新保存' : '确认添加'}
          </button>
        </div>
      </div>
    </div>
  );
};