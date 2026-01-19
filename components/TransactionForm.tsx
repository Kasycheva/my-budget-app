
import React, { useState, useEffect } from 'react';
import { Category, User, Transaction } from '../types.ts';
import { CATEGORY_ICONS } from '../constants.tsx';
import { PlusCircle, X, Trash2, Save, AlertCircle } from 'lucide-react';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdate: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  initialData?: Transaction;
  initialDate?: string;
  currentBalance: number;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onAdd, onUpdate, onDelete, onClose, initialData, initialDate, currentBalance 
}) => {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [user, setUser] = useState<User>('Мария');
  const [date, setDate] = useState<string>(initialDate || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setUser(initialData.user);
      setDate(initialData.date);
      setNote(initialData.note);
      setType(initialData.type);
    } else if (initialDate) {
      setDate(initialDate);
    }
  }, [initialData, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    
    const data = {
      amount: Number(amount),
      category,
      user,
      date,
      note,
      type
    };

    if (initialData) {
      onUpdate(initialData.id, data);
    } else {
      onAdd(data);
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const amountNum = Number(amount) || 0;
  const isEditing = !!initialData;
  const adjustedBalance = isEditing 
    ? currentBalance + (initialData.type === 'expense' ? initialData.amount : -initialData.amount)
    : currentBalance;
  const isOverBalance = type === 'expense' && amountNum > adjustedBalance;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all duration-300 overflow-y-auto no-scrollbar"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-auto">
        <div className="p-6 border-b flex justify-between items-center bg-indigo-50">
          <h2 className="text-2xl font-serif text-indigo-900">{isEditing ? 'Редактировать' : 'Новая транзакция'}</h2>
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="p-2 hover:bg-white rounded-full transition-colors text-indigo-400 active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setType('expense'); if (category === Category.INCOME) setCategory(Category.FOOD); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === 'expense' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
            >
              Расход
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(Category.INCOME); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === 'income' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}
            >
              Приход
            </button>
          </div>

          <div className="space-y-2 relative">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Сумма</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full text-4xl font-light py-2 border-b-2 outline-none transition-colors ${isOverBalance ? 'border-rose-300 focus:border-rose-500 text-rose-600' : 'border-gray-100 focus:border-indigo-500 text-slate-900'}`}
                autoFocus
                required
              />
              <span className={`absolute right-0 bottom-3 text-xl font-light transition-colors ${isOverBalance ? 'text-rose-300' : 'text-gray-400'}`}>kr</span>
            </div>
            {isOverBalance && (
              <div className="flex items-center gap-1.5 text-rose-500 text-[10px] font-bold mt-1 animate-in slide-in-from-top-1">
                <AlertCircle size={12} />
                <span>Внимание: сумма превышает доступный баланс ({Math.round(adjustedBalance).toLocaleString()} kr)</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Кто</label>
              <select
                value={user}
                onChange={(e) => setUser(e.target.value as User)}
                className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-100 border-none appearance-none"
              >
                <option value="Мария">Мария</option>
                <option value="Виктория">Виктория</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Дата</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-100 border-none"
              />
            </div>
          </div>

          {type === 'expense' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Категория</label>
              <div className="grid grid-cols-4 gap-2 h-40 overflow-y-auto no-scrollbar p-1">
                {Object.values(Category).filter(c => c !== Category.INCOME).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${category === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-200'}`}
                  >
                    <div className="mb-1">{CATEGORY_ICONS[cat]}</div>
                    <span className="text-[10px] text-center leading-tight truncate w-full">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Заметка (опционально)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="На что потрачено?"
              className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-100 border-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            {isEditing && (
              <button
                type="button"
                onClick={() => onDelete(initialData.id)}
                className="w-14 h-14 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center hover:bg-pink-100 transition-colors active:scale-90"
              >
                <Trash2 size={24} />
              </button>
            )}
            <button
              type="submit"
              className={`flex-1 font-semibold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-[0.98] ${isOverBalance ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-100 text-white' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 text-white'}`}
            >
              {isEditing ? <Save size={20} /> : <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />}
              {isEditing ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
