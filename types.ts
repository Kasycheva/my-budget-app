
export type User = 'Мария' | 'Виктория' | 'Общее';

export enum Category {
  RENT = 'Аренда',
  ELECTRICITY = 'Электричество',
  INTERNET = 'Интернет',
  FOOD = 'Еда',
  SUBSCRIPTIONS = 'Подписки',
  COURSES = 'Курсы',
  GAS = 'Бензин',
  AUTO_REPAIR = 'Авто-ремонт',
  CLOTHING = 'Одежда и обувь',
  PHARMACY = 'Аптека',
  DOCTOR = 'Врач',
  PARKING = 'Парковка',
  HOUSEHOLD_NEEDS = 'Хоз.нужды',
  ENTERTAINMENT = 'Развлечения',
  HOUSEHOLD_EXPENSES = 'Бытовые расходы',
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

export interface MonthlyStats {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

/* PLANS TYPES START */
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
/* PLANS TYPES END */
