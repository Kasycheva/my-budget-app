
import React from 'react';
import { 
  Home, Zap, Globe, Utensils, CreditCard, GraduationCap, 
  Fuel, Settings, ShoppingBag, Pill, Activity, MapPin, 
  Trash2, Music, Coffee, Plane, Cat, HelpCircle, TrendingUp,
  PiggyBank
} from 'lucide-react';
import { Category } from './types.ts';

export const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  [Category.RENT]: <Home size={20} />,
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

export const CATEGORY_COLORS: Record<Category, string> = {
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
