
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

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
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
    </div>
  );
};

const PlansView: React.FC<{ plans: Plan[], wise: number, onUpdate: (p: Plan[]) => void }> = ({ plans, wise, onUpdate }) => {
  return (
    <div className="space-y-10 pb-12">
      <div className="px-2">
        <h3 className="text-3xl font-serif text-indigo-950">Стратегические цели</h3>
        <p className="text-sm text-slate-400 mt-2 italic leading-relaxed">Накопления на Wise работают на ваши будущие победы</p>
      </div>
      {plans.map(plan => {
        const total = plan.items.reduce((s, i) => s + i.amount, 0);
        const progress = total > 0 ? Math.min((wise / total) * 100, 100) : 0;
        let runningTotal = wise;
        return (
          <div key={plan.id} className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className={`p-10 ${plan.color} text-white relative`}>
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-xl border border-white/20"><Target size={32} /></div>
                <div className="text-5xl font-light opacity-80">{Math.round(progress)}%</div>
              </div>
              <h4 className="text-2xl font-serif mb-2">{plan.title}</h4>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Бюджет: {total.toLocaleString()} kr</p>
            </div>
            <div className="p-10 space-y-8">
              {plan.items.map(item => {
                const itemSaved = Math.min(runningTotal, item.amount);
                const itemPerc = item.amount > 0 ? (itemSaved / item.amount) * 100 : 0;
                runningTotal = Math.max(0, runningTotal - item.amount);
                return (
                  <div key={item.id} className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-sm font-bold text-slate-700">{item.label}</span>
                      <span className="text-xs font-light text-slate-400">{item.amount.toLocaleString()} kr</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${itemPerc}%` }} />
                    </div>
                  </div>
                );
              })}
              <button onClick={() => {
                const newItems = [...plan.items, { id: Date.now().toString(), label: 'Новый пункт', amount: 0 }];
                onUpdate(plans.map(p => p.id === plan.id ? { ...p, items: newItems } : p));
              }} className="w-full py-5 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 text-[10px] font-bold uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-400 transition-all">Добавить подпункт</button>
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
      { id: 'p1', title: 'Аргентина 🇦🇷', color: 'bg-indigo-600', items: [{ id: 'i1', label: 'Билеты', amount: 15000 }, { id: 'i2', label: 'Жилье', amount: 12000 }] },
      { id: 'p2', title: 'Европа 🇪🇺', color: 'bg-emerald-500', items: [{ id: 'i3', label: 'Тур', amount: 20000 }] },
      { id: 'p3', title: 'Украина (Квартира) 🏠', color: 'bg-slate-800', items: [{ id: 'i4', label: 'Первый взнос', amount: 500000 }] }
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

  useEffect(() => {
    localStorage.setItem('velvet_tx', JSON.stringify(transactions));
    localStorage.setItem('velvet_plans', JSON.stringify(plans));
    localStorage.setItem('velvet_key', apiKey);
  }, [transactions, plans, apiKey]);

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
  const monthsNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  const metrics = useMemo(() => {
    const wise = transactions.filter(t => t.category === Category.SAVINGS && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalIn = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalOut = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { wise, wallet: totalIn - totalOut };
  }, [transactions]);

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
        <button onClick={() => setIsSettingsOpen(true)} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors"><Cloud size={24} /></button>
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
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                <span className="text-[9px] font-bold opacity-60 uppercase block mb-2 tracking-[0.2em]">На Цели / Wise</span>
                <div className="text-4xl font-light">{metrics.wise.toLocaleString()} <small className="text-sm opacity-40 uppercase">kr</small></div>
              </div>
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <span className="text-[9px] font-bold text-slate-300 uppercase block mb-2 tracking-[0.2em]">Кошелек</span>
                <div className="text-4xl font-light text-slate-800">{metrics.wallet.toLocaleString()} <small className="text-sm text-slate-200 uppercase">kr</small></div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-indigo-50 shadow-sm cursor-pointer hover:shadow-md transition-all group" onClick={async () => {
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
              <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] px-2">Последние записи</h3>
              <div className="space-y-4">
                {monthTx.length === 0 ? <div className="bg-white/50 border-2 border-dashed border-slate-100 py-16 rounded-[3rem] text-center text-slate-300 text-sm italic">Список пуст</div> : monthTx.slice(0, 5).map(t => (
                  <div key={t.id} onClick={() => { setEditingTx(t); setIsFormOpen(true); }} className="bg-white p-6 rounded-[2.5rem] border border-slate-50 flex items-center gap-6 active:scale-95 transition-all cursor-pointer hover:border-indigo-100 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: CATEGORY_COLORS[t.category] }}>{CATEGORY_ICONS[t.category]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-sm">{t.category}</span>
                        <span className="text-[8px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 font-bold uppercase">{t.user}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate">{t.note || '—'}</p>
                    </div>
                    <div className={`font-bold text-lg ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-800'}`}>{t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}</div>
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
          onAdd={d => setTransactions(prev => [...prev, { ...d, id: Date.now().toString() }])}
          onUpdate={(id, d) => setTransactions(prev => prev.map(t => t.id === id ? { ...d, id } : t))}
          onDelete={id => setTransactions(prev => prev.filter(t => t.id !== id))}
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
