
import React from 'react';
import { Transaction } from '../types.ts';

interface CalendarViewProps {
  transactions: Transaction[];
  currentMonth: number;
  currentYear: number;
  onSelectDate: (date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ transactions, currentMonth, currentYear, onSelectDate }) => {
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getDayTransactions = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return transactions.filter(t => t.date === dateStr);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-7 mb-4">
        {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map(i => <div key={`empty-${i}`} className="h-16" />)}
        {days.map(day => {
          const dayTrans = getDayTransactions(day);
          const income = dayTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
          const expense = dayTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
          
          return (
            <button
              key={day}
              onClick={() => onSelectDate(dateStr)}
              className={`h-20 p-2 rounded-2xl transition-all flex flex-col items-center group relative border ${isToday ? 'bg-indigo-50 border-indigo-100 shadow-sm' : 'border-transparent hover:bg-slate-50'}`}
            >
              <span className={`text-sm font-bold ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>
                {day}
              </span>
              <div className="mt-auto w-full space-y-1">
                {income > 0 && <div className="h-1 w-full bg-emerald-400 rounded-full" />}
                {expense > 0 && <div className="h-1 w-full bg-indigo-400 rounded-full" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
