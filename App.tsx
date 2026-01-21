
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, LayoutDashboard, Calendar as CalendarIcon, PieChart, Target, 
  Sparkles, ChevronLeft, ChevronRight, Cloud, RefreshCw,
  Home as HomeIcon, Zap, Globe, Utensils, CreditCard, GraduationCap, 
  Fuel, Settings, ShoppingBag, Pill, Activity, MapPin, 
  Trash2, Music, Coffee, Plane, Cat, HelpCircle, TrendingUp,
  PiggyBank, PlusCircle, X, Save, AlertCircle, Map, Info, Edit2, CheckCircle2
} from 'lucide-react';
import { PieChart as RPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import firebaseService from './services/firebaseService';

// --- TYPES ---
export type User = 'Мария' | 'Виктория' | 'Общее';

export enum Category {
  RENT = 'Аренда',
  ELECTRICITY = 'Электричество',
  INTERNET = 'Интернет',
  FOOD = 'Еда',
  SUBSCRIPTIONS = 'Подписки',
  COURSES = 'Курсы',
  GAS = 'Бензин',
  AUTO_REPAIR = 'СТО',
  CLOTHING = 'Одежда',
  PHARMACY = 'Аптека',
  DOCTOR = 'Врач',
  PARKING = 'Парковка',
  HOUSEHOLD_NEEDS = 'Хоз.нужды',
  ENTERTAINMENT = 'Развлечения',
  HOUSEHOLD_EXPENSES = 'Быт',
  TRAVEL = 'Путешествия',
  CAT_CARE = 'Кошачье хозяйство',
  UNFORESEEN = 'Непредвиденное',
  SAVINGS = 'Накопления',
  INCOME = 'Доход'
}

export interface Transaction {
  id: string;
  amount: number;
  category: Category;
  date: string;
  user: User;
  note: string;
  type: 'income' | 'expense';
}

export interface PlanItem {
  id: string;
  label: string;
  amount: number;
}

export interface Plan {
  id: string;
  title: string;
  items: PlanItem[];
  color: string;
}

// --- CONSTANTS ---
const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  [Category.RENT]: <HomeIcon size={20} />,
  [Category.ELECTRICITY]: <Zap size={20} />,
  [Category.INTERNET]: <Globe size={20} />,
  [Category.FOOD]: <Utensils size={20} />,
  [Category.SUBSCRIPTIONS]: <CreditCard size={20} />,
  [Category.COURSES]: <GraduationCap size={20} />,
  [Category.GAS]: <Fuel size={20} />,
  [Category.AUTO_REPAIR]: <Settings size={20} />,
  [Category.CLOTHING]: <ShoppingBag size={20} />,
  [Category.PHARMACY]: <Pill size={20} />,
  [Category.DOCTOR]: <Activity size={20} />,
  [Category.PARKING]: <MapPin size={20} />,
  [Category.HOUSEHOLD_NEEDS]: <Trash2 size={20} />,
  [Category.ENTERTAINMENT]: <Music size={20} />,
  [Category.HOUSEHOLD_EXPENSES]: <Coffee size={20} />,
  [Category.TRAVEL]: <Plane size={20} />,
  [Category.CAT_CARE]: <Cat size={20} />,
  [Category.UNFORESEEN]: <HelpCircle size={20} />,
  [Category.SAVINGS]: <PiggyBank size={20} />,
  [Category.INCOME]: <TrendingUp size={20} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  [Category.RENT]: '#6366f1',
  [Category.ELECTRICITY]: '#f59e0b',
  [Category.INTERNET]: '#3b82f6',
  [Category.FOOD]: '#10b981',
  [Category.SUBSCRIPTIONS]: '#ec4899',
  [Category.COURSES]: '#8b5cf6',
  [Category.GAS]: '#f43f5e',
  [Category.AUTO_REPAIR]: '#64748b',
  [Category.CLOTHING]: '#fb923c',
  [Category.PHARMACY]: '#14b8a6',
  [Category.DOCTOR]: '#ef4444',
  [Category.PARKING]: '#71717a',
  [Category.HOUSEHOLD_NEEDS]: '#a855f7',
  [Category.ENTERTAINMENT]: '#facc15',
  [Category.HOUSEHOLD_EXPENSES]: '#06b6d4',
  [Category.TRAVEL]: '#2dd4bf',
  [Category.CAT_CARE]: '#fb7185',
  [Category.UNFORESEEN]: '#475569',
  [Category.SAVINGS]: '#4f46e5',
  [Category.INCOME]: '#22c55e',
};

// --- SERVICES ---
const getFinancialAdvice = async (transactions: Transaction[], apiKey: string): Promise<string> => {
  if (!apiKey) return "⚠️ API ключ не настроен. Пожалуйста, введите его в настройках.";
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Ты - мудрый финансовый коуч Velvet Wallet. Проанализируй данные: ${JSON.stringify(transactions.slice(-20))}. Дай 3 кратких совета по экономии на русском языке. Используй эмодзи.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "ИИ задумался...";
  } catch (e) { return "AI временно недоступен."; }
};

// --- SUB-COMPONENTS ---

const TransactionForm: React.FC<{
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onUpdate: (id: string, t: Omit<Transaction, 'id'>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  initialData?: Transaction;
  currentBalance: number;
}> = ({ onAdd, onUpdate, onDelete, onClose, initialData, currentBalance }) => {
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [category, setCategory] = useState<Category>(initialData?.category || Category.FOOD);
  const [user, setUser] = useState<User>(initialData?.user || 'Мария');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState(initialData?.note || '');
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-auto" onClick={e => e.stopPropagation()}>
        <div className="p-8 border-b flex justify-between items-center bg-indigo-50/50">
          <h2 className="text-2xl font-serif text-indigo-950">{initialData ? 'Редактировать' : 'Новая запись'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><X size={24} /></button>
        </div>
        <form className="p-8 space-y-6" onSubmit={e => {
          e.preventDefault();
          const data = { amount: Number(amount), category, user, date, note, type };
          initialData ? onUpdate(initialData.id, data) : onAdd(data);
          onClose();
        }}>
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button type="button" onClick={() => { setType('expense'); setCategory(Category.FOOD); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${type === 'expense' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>Расход</button>
            <button type="button" onClick={() => { setType('income'); setCategory(Category.INCOME); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${type === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}>Приход</button>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Сумма</label>
            <div className="relative">
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full text-5xl font-light py-4 border-b-2 border-slate-100 outline-none focus:border-indigo-500 transition-colors bg-transparent" autoFocus required />
              <span className="absolute right-0 bottom-6 text-xl text-slate-300">kr</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Кто</label>
              <select value={user} onChange={e => setUser(e.target.value as User)} className="w-full bg-slate-50 rounded-2xl px-5 py-4 outline-none border border-slate-100 text-sm">
                <option value="Мария">Мария</option>
                <option value="Виктория">Виктория</option>
                <option value="Общее">Общее</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Дата</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 rounded-2xl px-5 py-4 outline-none border border-slate-100 text-sm" />
            </div>
          </div>
          {type === 'expense' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Категория</label>
              <div className="grid grid-cols-4 gap-2 h-40 overflow-y-auto no-scrollbar p-1">
                {Object.values(Category).filter(c => c !== Category.INCOME).map(cat => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)} className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${category === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}>
                    <div className="mb-1">{CATEGORY_ICONS[cat]}</div>
                    <span className="text-[9px] text-center leading-tight truncate w-full">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Заметка..." className="w-full bg-slate-50 rounded-2xl px-5 py-4 outline-none border border-slate-100 text-sm" />
          <div className="flex gap-4 pt-4">
            {initialData && <button type="button" onClick={() => onDelete(initialData.id)} className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center hover:bg-rose-100 transition-colors"><Trash2 size={24} /></button>}
            <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-5 rounded-[2rem] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
              {initialData ? <Save size={20} /> : <PlusCircle size={20} />}
              {initialData ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CalendarView: React.FC<{ transactions: Transaction[], month: number, year: number, onSelect: (d: string) => void }> = ({ transactions, month, year, onSelect }) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  return (
    <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 space-y-6">
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
        {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDay }).map((_, i) => <div key={i} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayTxs = transactions.filter(t => t.date === dateStr);
          const hasInc = dayTxs.some(t => t.type === 'income');
          const hasExp = dayTxs.some(t => t.type === 'expense');
          const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
          return (
            <button key={day} onClick={() => onSelect(dateStr)} className={`h-16 rounded-2xl flex flex-col items-center justify-center relative transition-all ${isToday ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50'}`}>
              <span className={`text-sm font-bold ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>{day}</span>
              <div className="flex gap-0.5 mt-1">
                {hasInc && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                {hasExp && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ReportsView: React.FC<{ transactions: Transaction[], month: number, year: number }> = ({ transactions, month, year }) => {
  const data = useMemo(() => {
    const filtered = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year && t.type === 'expense';
    });
    const cats: Record<string, number> = {};
    filtered.forEach(t => cats[t.category] = (cats[t.category] || 0) + t.amount);
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions, month, year]);

  const monthTotals = useMemo(() => {
    const filtered = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings = filtered.filter(t => t.category === Category.SAVINGS && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, savings, balance: income - expense };
  }, [transactions, month, year]);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 sm:p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <h3 className="text-xl font-serif text-indigo-950 mb-8 text-center">Траты по категориям</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer>
            <RPieChart>
              <Pie data={data} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                {data.map((entry, idx) => <Cell key={idx} fill={CATEGORY_COLORS[entry.name] || '#cbd5e1'} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)'}} />
            </RPieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4 mt-8 max-h-60 overflow-y-auto no-scrollbar">
          {data.map(c => (
            <div key={c.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[c.name] }} />
                <span className="text-sm font-bold text-slate-700">{c.name}</span>
              </div>
              <span className="text-sm font-light text-slate-500">{c.value.toLocaleString()} kr</span>
            </div>
          ))}
        </div>
      </div>

      {/* Income vs Expense Comparison */}
      <div className="bg-white p-6 sm:p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <h3 className="text-xl font-serif text-indigo-950 mb-6 text-center">Приход vs Расход</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-emerald-50 p-6 rounded-3xl text-center">
            <div className="text-[10px] font-bold text-emerald-600 uppercase mb-2 tracking-wider">Приход</div>
            <div className="text-2xl font-light text-emerald-700">{monthTotals.income.toLocaleString()} <span className="text-sm opacity-50">kr</span></div>
          </div>
          <div className="bg-rose-50 p-6 rounded-3xl text-center">
            <div className="text-[10px] font-bold text-rose-600 uppercase mb-2 tracking-wider">Расход</div>
            <div className="text-2xl font-light text-rose-700">{monthTotals.expense.toLocaleString()} <span className="text-sm opacity-50">kr</span></div>
          </div>
          <div className="bg-indigo-50 p-6 rounded-3xl text-center">
            <div className="text-[10px] font-bold text-indigo-600 uppercase mb-2 tracking-wider">Накопления</div>
            <div className="text-2xl font-light text-indigo-700">{monthTotals.savings.toLocaleString()} <span className="text-sm opacity-50">kr</span></div>
          </div>
          <div className={`p-6 rounded-3xl text-center ${monthTotals.balance >= 0 ? 'bg-teal-50' : 'bg-amber-50'}`}>
            <div className={`text-[10px] font-bold uppercase mb-2 tracking-wider ${monthTotals.balance >= 0 ? 'text-teal-600' : 'text-amber-600'}`}>Остаток</div>
            <div className={`text-2xl font-light ${monthTotals.balance >= 0 ? 'text-teal-700' : 'text-amber-700'}`}>
              {monthTotals.balance >= 0 ? '+' : ''}{monthTotals.balance.toLocaleString()} <span className="text-sm opacity-50">kr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlansView: React.FC<{ plans: Plan[], wise: number, onUpdate: (p: Plan[]) => void }> = ({ plans, wise, onUpdate }) => {
  const [editingItem, setEditingItem] = useState<{ planId: string, item: PlanItem } | null>(null);
  const [isAddingItem, setIsAddingItem] = useState<string | null>(null);

  return (
    <div className="space-y-10 pb-12">
      <div className="px-2">
        <h3 className="text-2xl sm:text-3xl font-serif text-indigo-950">Стратегические цели</h3>
        <p className="text-sm text-slate-400 mt-2 italic leading-relaxed">Накопления на Wise работают на ваши будущие победы</p>
      </div>
      {plans.map(plan => {
        const total = plan.items.reduce((s, i) => s + i.amount, 0);
        const progress = total > 0 ? Math.min((wise / total) * 100, 100) : 0;
        let runningTotal = wise;
        
        return (
          <div key={plan.id} className="bg-white rounded-[3.5rem] shadow-lg border border-slate-100 overflow-hidden">
            <div className={`p-8 sm:p-10 ${plan.color} text-white relative`}>
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-xl border border-white/20">
                  <Target size={32} />
                </div>
                <div className="text-right">
                  <div className="text-5xl font-light opacity-90">{Math.round(progress)}%</div>
                  <div className="text-xs opacity-60 uppercase tracking-wider mt-1">выполнено</div>
                </div>
              </div>
              <h4 className="text-2xl font-serif mb-2 relative z-10">{plan.title}</h4>
              <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">Общая цель: {total.toLocaleString()} kr</p>
              
              {/* Overall Progress Bar */}
              <div className="mt-6 relative z-10">
                <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className="h-full bg-white transition-all duration-1000 shadow-lg" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            </div>
            
            <div className="p-8 sm:p-10 space-y-6">
              {/* Wise Savings Display */}
              <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PiggyBank size={24} className="text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-900">Накоплено в Wise</span>
                  </div>
                  <span className="text-2xl font-light text-indigo-700">{wise.toLocaleString()} <span className="text-sm opacity-50">kr</span></span>
                </div>
              </div>

              {/* Subcategories */}
              {plan.items.map((item, idx) => {
                const itemSaved = Math.min(runningTotal, item.amount);
                const itemPerc = item.amount > 0 ? (itemSaved / item.amount) * 100 : 0;
                runningTotal = Math.max(0, runningTotal - item.amount);
                
                const isEditing = editingItem?.planId === plan.id && editingItem?.item.id === item.id;
                
                return (
                  <div key={item.id} className="space-y-3 group">
                    {isEditing ? (
                      <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                        <input
                          type="text"
                          defaultValue={item.label}
                          placeholder="Название"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400"
                          id={`label-${item.id}`}
                        />
                        <input
                          type="number"
                          defaultValue={item.amount}
                          placeholder="Сумма"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400"
                          id={`amount-${item.id}`}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const newLabel = (document.getElementById(`label-${item.id}`) as HTMLInputElement).value;
                              const newAmount = Number((document.getElementById(`amount-${item.id}`) as HTMLInputElement).value);
                              const updatedItems = plan.items.map(i => 
                                i.id === item.id ? { ...i, label: newLabel, amount: newAmount } : i
                              );
                              onUpdate(plans.map(p => p.id === plan.id ? { ...p, items: updatedItems } : p));
                              setEditingItem(null);
                            }}
                            className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                          >
                            Сохранить
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="px-4 bg-slate-200 text-slate-600 py-2 rounded-xl text-sm font-bold hover:bg-slate-300 transition-colors"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center px-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-700">{item.label}</span>
                            <span className="text-xs font-light text-slate-400">{item.amount.toLocaleString()} kr</span>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingItem({ planId: plan.id, item })}
                              className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (!confirm(`Удалить "${item.label}"?`)) return;
                                const updatedItems = plan.items.filter(i => i.id !== item.id);
                                onUpdate(plans.map(p => p.id === plan.id ? { ...p, items: updatedItems } : p));
                              }}
                              className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 transition-all duration-1000" 
                              style={{ width: `${itemPerc}%` }} 
                            />
                          </div>
                          <div className="absolute right-0 -top-5 text-xs font-bold text-indigo-600">
                            {Math.round(itemPerc)}%
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              
              {/* Add New Subcategory */}
              {isAddingItem === plan.id ? (
                <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                  <input
                    type="text"
                    placeholder="Название новой категории"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400"
                    id={`new-label-${plan.id}`}
                  />
                  <input
                    type="number"
                    placeholder="Сумма"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400"
                    id={`new-amount-${plan.id}`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const newLabel = (document.getElementById(`new-label-${plan.id}`) as HTMLInputElement).value;
                        const newAmount = Number((document.getElementById(`new-amount-${plan.id}`) as HTMLInputElement).value);
                        if (!newLabel || !newAmount) return;
                        const newItem: PlanItem = { id: Date.now().toString(), label: newLabel, amount: newAmount };
                        const updatedItems = [...plan.items, newItem];
                        onUpdate(plans.map(p => p.id === plan.id ? { ...p, items: updatedItems } : p));
                        setIsAddingItem(null);
                      }}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                    >
                      Добавить
                    </button>
                    <button
                      onClick={() => setIsAddingItem(null)}
                      className="px-4 bg-slate-200 text-slate-600 py-2 rounded-xl text-sm font-bold hover:bg-slate-300 transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingItem(plan.id)}
                  className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 text-xs font-bold uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                >
                  <PlusCircle size={18} />
                  Добавить подкатегорию
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- MAIN APP ---
const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const s = localStorage.getItem('velvet_tx');
    return s ? JSON.parse(s) : [];
  });
  const [plans, setPlans] = useState<Plan[]>(() => {
    const s = localStorage.getItem('velvet_plans');
    return s ? JSON.parse(s) : [
      { 
        id: 'p1', 
        title: 'Аргентина 🇦🇷', 
        color: 'bg-gradient-to-br from-sky-400 to-blue-500', 
        items: [
          { id: 'i1', label: 'Билеты (на 2 человек + кот)', amount: 16000 },
          { id: 'i2', label: 'Съем квартиры на 4 месяца', amount: 10000 },
          { id: 'i3', label: 'Еда на 3 месяца', amount: 5000 },
          { id: 'i4', label: 'Страховка', amount: 2000 },
          { id: 'i5', label: 'Непредвиденные расходы', amount: 5000 }
        ] 
      },
      { 
        id: 'p2', 
        title: 'Европа 🇪🇺', 
        color: 'bg-gradient-to-br from-emerald-400 to-green-500', 
        items: [
          { id: 'i6', label: 'Билеты', amount: 10000 },
          { id: 'i7', label: 'Квартира', amount: 32000 },
          { id: 'i8', label: 'Еда', amount: 20000 },
          { id: 'i9', label: 'Непредвиденные расходы', amount: 6000 }
        ] 
      },
      { 
        id: 'p3', 
        title: 'Украина 🏠', 
        color: 'bg-gradient-to-br from-amber-400 to-yellow-500', 
        items: [
          { id: 'i10', label: 'Покупка квартиры', amount: 500000 },
          { id: 'i11', label: 'Ремонт', amount: 100000 },
          { id: 'i12', label: 'Билеты', amount: 5000 },
          { id: 'i13', label: 'Еда', amount: 5000 },
          { id: 'i14', label: 'Непредвиденные расходы', amount: 3000 }
        ] 
      }
    ];
  });
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'reports' | 'plans'>('home');
  const [viewDate, setViewDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('velvet_key') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(firebaseService.isOnline());

  // Вычисляем текущий месяц и год из viewDate
  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();

  // Сохранение в localStorage (offline fallback)
  useEffect(() => {
    localStorage.setItem('velvet_tx', JSON.stringify(transactions));
    localStorage.setItem('velvet_plans', JSON.stringify(plans));
    localStorage.setItem('velvet_key', apiKey);
  }, [transactions, plans, apiKey]);

  // Firebase синхронизация транзакций
  useEffect(() => {
    if (!isOnline) return;

    const unsubscribe = firebaseService.subscribeToTransactions(
      year,
      month,
      (firebaseTransactions) => {
        // Обновляем только если данные из Firebase отличаются
        const currentMonthTx = transactions.filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === month && d.getFullYear() === year;
        });
        
        if (JSON.stringify(currentMonthTx) !== JSON.stringify(firebaseTransactions)) {
          // Объединяем firebase данные с транзакциями из других месяцев
          const otherMonthsTx = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() !== month || d.getFullYear() !== year;
          });
          setTransactions([...otherMonthsTx, ...firebaseTransactions]);
        }
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [month, year, isOnline]);

  // Firebase синхронизация планов
  useEffect(() => {
    if (!isOnline) return;

    const unsubscribe = firebaseService.subscribeToplans(
      year,
      month,
      (firebasePlans) => {
        if (firebasePlans.length > 0 && JSON.stringify(plans) !== JSON.stringify(firebasePlans)) {
          setPlans(firebasePlans);
        }
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [month, year, isOnline]);

  const monthsNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  const metrics = useMemo(() => {
    const lastDayOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
    const historyUpToMonth = transactions.filter(t => new Date(t.date) <= lastDayOfMonth);
    
    const wise = transactions.filter(t => t.category === Category.SAVINGS && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalIn = historyUpToMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalOut = historyUpToMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    return { wise, wallet: totalIn - totalOut };
  }, [transactions, month, year]);

  const monthTx = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, month, year]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-40">
      <header className="bg-white border-b border-slate-100 px-8 h-24 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-indigo-100 text-white"><Sparkles size={24} /></div>
          <h1 className="text-3xl font-serif text-indigo-950 tracking-tight">Velvet</h1>
        </div>
        <div className="flex items-center gap-3">
          {isOnline && (
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Синхронизировано</span>
            </div>
          )}
          <button onClick={() => setIsSettingsOpen(true)} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors"><Cloud size={24} /></button>
        </div>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto p-6 space-y-10">
        {activeTab !== 'plans' && (
          <div className="flex items-center justify-between bg-white px-8 py-5 rounded-[2.5rem] shadow-sm border border-slate-100">
            <button onClick={() => setViewDate(new Date(year, month - 1))} className="p-3 text-slate-300 hover:text-indigo-600 transition-colors"><ChevronLeft /></button>
            <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-[0.3em]">{monthsNames[month]} {year}</h2>
            <button onClick={() => setViewDate(new Date(year, month + 1))} className="p-3 text-slate-300 hover:text-indigo-600 transition-colors"><ChevronRight /></button>
          </div>
        )}

        {activeTab === 'home' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-indigo-600 p-6 sm:p-8 rounded-[3rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                <span className="text-[9px] font-bold opacity-60 uppercase block mb-2 tracking-[0.2em]">На Цели / Wise</span>
                <div className="text-3xl sm:text-4xl font-light">{metrics.wise.toLocaleString()} <small className="text-sm opacity-40 uppercase">kr</small></div>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <span className="text-[9px] font-bold text-slate-300 uppercase block mb-2 tracking-[0.2em]">Кошелек</span>
                <div className={`text-3xl sm:text-4xl font-light ${metrics.wallet < 0 ? 'text-rose-500' : 'text-slate-800'}`}>
                  {metrics.wallet.toLocaleString()} <small className="text-sm text-slate-200 uppercase">kr</small>
                  {metrics.wallet < 0 && <div className="text-[10px] text-rose-400 mt-1 flex items-center gap-1"><AlertCircle size={12} /> Баланс в минусе</div>}
                </div>
              </div>
            </div>

            {/* Transfer Button */}
            <button 
              onClick={async () => {
                const amount = prompt('Сколько перевести в Wise?');
                if (!amount || isNaN(Number(amount))) return;
                const transferTx: Omit<Transaction, 'id'> = {
                  amount: Number(amount),
                  category: Category.SAVINGS,
                  date: new Date().toISOString().split('T')[0],
                  user: 'Общее',
                  note: 'Перевод в Wise',
                  type: 'expense'
                };
                const newTx = { ...transferTx, id: Date.now().toString() };
                setTransactions(prev => [...prev, newTx]);
                if (isOnline) {
                  const txDate = new Date(newTx.date);
                  await firebaseService.saveTransaction(newTx, txDate.getFullYear(), txDate.getMonth());
                }
              }}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-[2.5rem] shadow-lg flex items-center justify-center gap-3 font-bold hover:shadow-xl transition-all active:scale-95"
            >
              <PiggyBank size={24} />
              Перевести в Wise (Общее)
            </button>

            <div className="bg-white p-6 sm:p-8 rounded-[3rem] border border-indigo-50 shadow-sm cursor-pointer hover:shadow-md transition-all group" onClick={async () => {
              if (isAiLoading) return;
              setIsAiLoading(true);
              const advice = await getFinancialAdvice(transactions, apiKey);
              setAiAdvice(advice);
              setIsAiLoading(false);
            }}>
              <div className="flex items-center gap-3 mb-3">
                <Sparkles size={18} className={`text-indigo-500 ${isAiLoading ? 'animate-spin' : ''}`} />
                <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Магия ИИ Velvet</h4>
              </div>
              <p className="text-sm text-slate-600 italic leading-relaxed">{aiAdvice || "Нажмите, чтобы получить мудрый совет от вашего финансового коуча."}</p>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] px-2">Последние записи ({monthTx.length})</h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
                {monthTx.length === 0 ? <div className="bg-white/50 border-2 border-dashed border-slate-100 py-16 rounded-[3rem] text-center text-slate-300 text-sm italic">Список пуст</div> : monthTx.map(t => (
                  <div key={t.id} className="bg-white p-4 sm:p-6 rounded-[2.5rem] border border-slate-50 flex items-center gap-3 sm:gap-6 hover:border-indigo-100 shadow-sm transition-all group">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: CATEGORY_COLORS[t.category] }}>{CATEGORY_ICONS[t.category]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-sm">{t.category}</span>
                        <span className="text-[8px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 font-bold uppercase">{t.user}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate">{t.note || '—'}</p>
                    </div>
                    <div className={`font-bold text-base sm:text-lg ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-800'}`}>{t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}</div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); setEditingTx(t); setIsFormOpen(true); }} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={async (e) => { 
                        e.stopPropagation(); 
                        if (!confirm('Удалить эту транзакцию?')) return;
                        setTransactions(prev => prev.filter(tx => tx.id !== t.id));
                        if (isOnline) {
                          const txDate = new Date(t.date);
                          await firebaseService.deleteTransaction(t.id, txDate.getFullYear(), txDate.getMonth());
                        }
                      }} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && <CalendarView transactions={transactions} month={month} year={year} onSelect={(d) => { setEditingTx(null); setIsFormOpen(true); }} />}
        {activeTab === 'reports' && <ReportsView transactions={transactions} month={month} year={year} />}
        {activeTab === 'plans' && <PlansView plans={plans} wise={metrics.wise} onUpdate={setPlans} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-3xl border-t border-slate-100 p-8 z-40 pb-12">
        <div className="max-w-md mx-auto flex items-center justify-between gap-6">
          <div className="flex-1 flex justify-around bg-slate-50/50 p-2 rounded-[2.5rem] border border-slate-100">
            <button onClick={() => setActiveTab('home')} className={`p-5 rounded-3xl transition-all ${activeTab === 'home' ? 'bg-white text-indigo-600 shadow-sm border border-slate-50' : 'text-slate-300 hover:text-indigo-400'}`}><LayoutDashboard size={26} /></button>
            <button onClick={() => setActiveTab('calendar')} className={`p-5 rounded-3xl transition-all ${activeTab === 'calendar' ? 'bg-white text-indigo-600 shadow-sm border border-slate-50' : 'text-slate-300 hover:text-indigo-400'}`}><CalendarIcon size={26} /></button>
            <button onClick={() => setActiveTab('reports')} className={`p-5 rounded-3xl transition-all ${activeTab === 'reports' ? 'bg-white text-indigo-600 shadow-sm border border-slate-50' : 'text-slate-300 hover:text-indigo-400'}`}><PieChart size={26} /></button>
            <button onClick={() => setActiveTab('plans')} className={`p-5 rounded-3xl transition-all ${activeTab === 'plans' ? 'bg-white text-indigo-600 shadow-sm border border-slate-50' : 'text-slate-300 hover:text-indigo-400'}`}><Target size={26} /></button>
          </div>
          <button onClick={() => { setEditingTx(null); setIsFormOpen(true); }} className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] shadow-2xl shadow-indigo-200 flex items-center justify-center shrink-0 active:scale-90 hover:bg-indigo-700 transition-all"><Plus size={44} /></button>
        </div>
      </nav>

      {(isFormOpen || editingTx) && (
        <TransactionForm 
          onAdd={async (d) => {
            const newTx = { ...d, id: Date.now().toString() };
            setTransactions(prev => [...prev, newTx]);
            
            // Sync to Firebase
            if (isOnline) {
              const txDate = new Date(newTx.date);
              await firebaseService.saveTransaction(newTx, txDate.getFullYear(), txDate.getMonth());
            }
          }}
          onUpdate={async (id, d) => {
            const updatedTx = { ...d, id };
            setTransactions(prev => prev.map(t => t.id === id ? updatedTx : t));
            
            // Sync to Firebase
            if (isOnline) {
              const txDate = new Date(updatedTx.date);
              await firebaseService.saveTransaction(updatedTx, txDate.getFullYear(), txDate.getMonth());
            }
          }}
          onDelete={async (id) => {
            const transaction = transactions.find(t => t.id === id);
            setTransactions(prev => prev.filter(t => t.id !== id));
            
            // Delete from Firebase
            if (isOnline && transaction) {
              const txDate = new Date(transaction.date);
              await firebaseService.deleteTransaction(id, txDate.getFullYear(), txDate.getMonth());
            }
          }}
          onClose={() => { setIsFormOpen(false); setEditingTx(null); }}
          initialData={editingTx || undefined}
          currentBalance={metrics.wallet}
        />
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-8" onClick={() => setIsSettingsOpen(false)}>
          <div className="bg-white rounded-[3.5rem] w-full max-w-sm p-12 space-y-10" onClick={e => e.stopPropagation()}>
            <h3 className="text-3xl font-serif text-slate-900">Настройки</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-1">Gemini API Key</label>
                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-5 outline-none text-sm focus:border-indigo-300 transition-all" placeholder="Вставьте ключ..." />
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-bold shadow-xl shadow-slate-200">Готово</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
