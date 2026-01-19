
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Transaction, Category } from '../types.ts';
import { CATEGORY_COLORS } from '../constants.tsx';

interface ReportsProps {
  transactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
}

const Reports: React.FC<ReportsProps> = ({ transactions, selectedMonth, selectedYear }) => {
  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredData.filter(t => t.type === 'expense').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const yearlyData = useMemo(() => {
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    return months.map((m, idx) => {
      const monthTrans = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === idx && d.getFullYear() === selectedYear;
      });
      const income = monthTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      return { name: m, доход: income, расход: expense };
    });
  }, [transactions, selectedYear]);

  if (filteredData.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
        <h3 className="text-xl font-serif text-gray-800">Нет данных для анализа</h3>
        <p className="text-gray-400 mt-2">Добавьте транзакции за этот месяц, чтобы увидеть отчеты</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-serif text-indigo-900 mb-6">Расходы по категориям</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category] || '#ccc'} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: number) => [`${value.toLocaleString()} kr`, 'Сумма']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center gap-3 text-sm p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[c.name as Category] }} />
                <span className="text-gray-600 truncate flex-1">{c.name}</span>
                <span className="font-semibold text-gray-900">{c.value.toLocaleString()} kr</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-serif text-indigo-900 mb-6">Динамика года ({selectedYear})</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}} 
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                formatter={(value: number) => [`${value.toLocaleString()} kr`, '']}
              />
              <Bar dataKey="доход" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="расход" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
