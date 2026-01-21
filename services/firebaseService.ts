import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  onValue, 
  push, 
  remove,
  update,
  Database 
} from 'firebase/database';
import { firebaseConfig } from '../firebaseConfig';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  user: string;
  note: string;
  type: 'income' | 'expense';
}

export interface MonthData {
  transactions: Transaction[];
  plans: any[];
  wise: number;
  balance: number;
}

class FirebaseService {
  private app: FirebaseApp | null = null;
  private db: Database | null = null;
  private isInitialized = false;

  constructor() {
    try {
      // Инициализация Firebase только если config корректный
      if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        this.app = initializeApp(firebaseConfig);
        this.db = getDatabase(this.app);
        this.isInitialized = true;
      }
    } catch (error) {
      console.warn('Firebase не инициализирован. Работаем в локальном режиме.', error);
    }
  }

  // Проверка инициализации
  isOnline(): boolean {
    return this.isInitialized;
  }

  // Получить путь к данным месяца
  private getMonthPath(year: number, month: number): string {
    return `months/${year}/${month.toString().padStart(2, '0')}`;
  }

  // Сохранить транзакцию
  async saveTransaction(transaction: Transaction, year: number, month: number): Promise<void> {
    if (!this.db) return;
    
    try {
      const monthPath = this.getMonthPath(year, month);
      const transactionRef = ref(this.db, `${monthPath}/transactions/${transaction.id}`);
      await set(transactionRef, transaction);
    } catch (error) {
      console.error('Ошибка сохранения транзакции:', error);
      throw error;
    }
  }

  // Удалить транзакцию
  async deleteTransaction(transactionId: string, year: number, month: number): Promise<void> {
    if (!this.db) return;
    
    try {
      const monthPath = this.getMonthPath(year, month);
      const transactionRef = ref(this.db, `${monthPath}/transactions/${transactionId}`);
      await remove(transactionRef);
    } catch (error) {
      console.error('Ошибка удаления транзакции:', error);
      throw error;
    }
  }

  // Получить транзакции месяца
  async getTransactions(year: number, month: number): Promise<Transaction[]> {
    if (!this.db) return [];
    
    try {
      const monthPath = this.getMonthPath(year, month);
      const transactionsRef = ref(this.db, `${monthPath}/transactions`);
      const snapshot = await get(transactionsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data);
      }
      return [];
    } catch (error) {
      console.error('Ошибка получения транзакций:', error);
      return [];
    }
  }

  // Подписаться на изменения транзакций
  subscribeToTransactions(
    year: number, 
    month: number, 
    callback: (transactions: Transaction[]) => void
  ): (() => void) | null {
    if (!this.db) return null;
    
    try {
      const monthPath = this.getMonthPath(year, month);
      const transactionsRef = ref(this.db, `${monthPath}/transactions`);
      
      const unsubscribe = onValue(transactionsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const transactions: Transaction[] = Object.values(data);
          callback(transactions);
        } else {
          callback([]);
        }
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Ошибка подписки на транзакции:', error);
      return null;
    }
  }

  // Сохранить планы
  async savePlans(plans: any[], year: number, month: number): Promise<void> {
    if (!this.db) return;
    
    try {
      const monthPath = this.getMonthPath(year, month);
      const plansRef = ref(this.db, `${monthPath}/plans`);
      await set(plansRef, plans);
    } catch (error) {
      console.error('Ошибка сохранения планов:', error);
      throw error;
    }
  }

  // Получить планы
  async getPlans(year: number, month: number): Promise<any[]> {
    if (!this.db) return [];
    
    try {
      const monthPath = this.getMonthPath(year, month);
      const plansRef = ref(this.db, `${monthPath}/plans`);
      const snapshot = await get(plansRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return [];
    } catch (error) {
      console.error('Ошибка получения планов:', error);
      return [];
    }
  }

  // Подписаться на изменения планов
  subscribeToplans(
    year: number, 
    month: number, 
    callback: (plans: any[]) => void
  ): (() => void) | null {
    if (!this.db) return null;
    
    try {
      const monthPath = this.getMonthPath(year, month);
      const plansRef = ref(this.db, `${monthPath}/plans`);
      
      const unsubscribe = onValue(plansRef, (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.val());
        } else {
          callback([]);
        }
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Ошибка подписки на планы:', error);
      return null;
    }
  }

  // Сохранить wise
  async saveWise(wise: number, year: number, month: number): Promise<void> {
    if (!this.db) return;
    
    try {
      const monthPath = this.getMonthPath(year, month);
      const wiseRef = ref(this.db, `${monthPath}/wise`);
      await set(wiseRef, wise);
    } catch (error) {
      console.error('Ошибка сохранения wise:', error);
      throw error;
    }
  }

  // Получить wise
  async getWise(year: number, month: number): Promise<number> {
    if (!this.db) return 0;
    
    try {
      const monthPath = this.getMonthPath(year, month);
      const wiseRef = ref(this.db, `${monthPath}/wise`);
      const snapshot = await get(wiseRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return 0;
    } catch (error) {
      console.error('Ошибка получения wise:', error);
      return 0;
    }
  }

  // Перенести данные в следующий месяц
  async transferToNextMonth(
    currentYear: number, 
    currentMonth: number, 
    nextYear: number, 
    nextMonth: number,
    balance: number
  ): Promise<void> {
    if (!this.db) return;
    
    try {
      // Получаем планы из текущего месяца
      const currentPlans = await this.getPlans(currentYear, currentMonth);
      const currentWise = await this.getWise(currentYear, currentMonth);
      
      // Создаем транзакцию переноса баланса
      if (balance !== 0) {
        const transferTransaction: Transaction = {
          id: `transfer_${Date.now()}`,
          amount: Math.abs(balance),
          category: balance > 0 ? 'INCOME' : 'UNFORESEEN',
          date: `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`,
          user: 'Kasyc',
          note: `Перенос из ${currentMonth}/${currentYear}`,
          type: balance > 0 ? 'income' : 'expense'
        };
        
        await this.saveTransaction(transferTransaction, nextYear, nextMonth);
      }
      
      // Копируем планы в следующий месяц
      if (currentPlans.length > 0) {
        await this.savePlans(currentPlans, nextYear, nextMonth);
      }
      
      // Копируем wise
      if (currentWise > 0) {
        await this.saveWise(currentWise, nextYear, nextMonth);
      }
    } catch (error) {
      console.error('Ошибка переноса данных:', error);
      throw error;
    }
  }

  // Получить все данные месяца
  async getMonthData(year: number, month: number): Promise<MonthData> {
    const [transactions, plans, wise] = await Promise.all([
      this.getTransactions(year, month),
      this.getPlans(year, month),
      this.getWise(year, month)
    ]);

    const balance = transactions.reduce((sum, t) => {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }, 0);

    return { transactions, plans, wise, balance };
  }

  // Подписаться на все изменения месяца
  subscribeToMonth(
    year: number,
    month: number,
    onUpdate: (data: MonthData) => void
  ): (() => void) | null {
    if (!this.db) return null;

    const monthPath = this.getMonthPath(year, month);
    const monthRef = ref(this.db, monthPath);

    const unsubscribe = onValue(monthRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = await this.getMonthData(year, month);
        onUpdate(data);
      } else {
        onUpdate({ transactions: [], plans: [], wise: 0, balance: 0 });
      }
    });

    return unsubscribe;
  }
}

// Создаем singleton instance
const firebaseService = new FirebaseService();

export default firebaseService;
