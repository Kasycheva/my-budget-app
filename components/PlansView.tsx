
import React from 'react';
import { Plan, PlanItem } from '../types.ts';
import { Globe, Map, Home as HomeIcon, Trash2, Plus, Info, Edit2, CheckCircle2 } from 'lucide-react';

interface PlansViewProps {
  plans: Plan[];
  currentSavings: number;
  onUpdatePlanItem: (planId: string, itemId: string, updates: Partial<PlanItem>) => void;
  onUpdatePlanTitle: (planId: string, newTitle: string) => void;
  onAddPlanItem: (planId: string) => void;
  onDeletePlanItem: (planId: string, itemId: string) => void;
}

const PlansView: React.FC<PlansViewProps> = ({ 
  plans, 
  currentSavings, 
  onUpdatePlanItem, 
  onUpdatePlanTitle,
  onAddPlanItem, 
  onDeletePlanItem 
}) => {
  const getPlanIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('аргентин')) return <Globe className="text-white" size={24} />;
    if (t.includes('европ')) return <Map className="text-white" size={24} />;
    return <HomeIcon className="text-white" size={24} />;
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="px-2">
        <h3 className="text-2xl font-serif text-indigo-900">Стратегические цели</h3>
        <p className="text-sm text-slate-400 mt-2">Средства на Wise работают на ваши мечты</p>
      </div>

      {plans.map((plan) => {
        const totalNeeded = plan.items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const progress = totalNeeded > 0 ? Math.min((currentSavings / totalNeeded) * 100, 100) : 0;
        let remainingForItems = currentSavings;

        return (
          <div key={plan.id} className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden mb-8">
            <div className={`p-8 ${plan.color} text-white`}>
              <div className="flex justify-between items-start mb-4">
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                  {getPlanIcon(plan.title)}
                </div>
                <div className="text-3xl font-light">{Math.round(progress)}%</div>
              </div>
              <input
                type="text"
                value={plan.title}
                onChange={(e) => onUpdatePlanTitle(plan.id, e.target.value)}
                className="text-xl font-serif bg-transparent outline-none border-b border-transparent focus:border-white/30 w-full mb-1"
                placeholder="Цель..."
              />
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">
                Бюджет: {totalNeeded.toLocaleString()} kr
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-5">
                {plan.items.map((item) => {
                  const itemAmount = item.amount || 0;
                  const itemSaved = Math.min(remainingForItems, itemAmount);
                  const itemProgress = itemAmount > 0 ? (itemSaved / itemAmount) * 100 : 0;
                  const isCompleted = itemProgress >= 100 && itemAmount > 0;
                  remainingForItems = Math.max(0, remainingForItems - itemAmount);

                  return (
                    <div key={item.id} className="space-y-2 group">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => onUpdatePlanItem(plan.id, item.id, { label: e.target.value })}
                          className="flex-1 bg-transparent text-sm outline-none border-b border-transparent focus:border-indigo-100 py-1"
                        />
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                          <input
                            type="number"
                            value={item.amount || ''}
                            onChange={(e) => onUpdatePlanItem(plan.id, item.id, { amount: Number(e.target.value) })}
                            className="w-16 text-right bg-transparent text-sm font-bold"
                          />
                          <span className="text-[10px] font-bold text-slate-300">kr</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ${isCompleted ? 'bg-emerald-400' : 'bg-indigo-300'}`}
                          style={{ width: `${itemProgress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => onAddPlanItem(plan.id)}
                className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs font-bold uppercase flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Добавить пункт
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlansView;
