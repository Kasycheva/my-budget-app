
import { GoogleGenAI } from "@google/genai";
import { Transaction, Category } from "../types.ts";

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  const savedKey = localStorage.getItem('velvet_gemini_api_key');
  
  if (!savedKey) {
    return "⚠️ API ключ не настроен. Пожалуйста, введите его в настройках (иконка облака), чтобы ИИ заработал.";
  }

  const ai = new GoogleGenAI({ apiKey: savedKey });

  const expenses = transactions.filter(t => t.type === 'expense' && t.category !== Category.SAVINGS);
  const savings = transactions.filter(t => t.category === Category.SAVINGS);

  const expenseSummary = expenses.reduce((acc, t) => {
    const key = `${t.user}-${t.category}`;
    acc[key] = (acc[key] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalSavings = savings.reduce((sum, t) => sum + t.amount, 0);

  const prompt = `
    Ты - мудрый финансовый коуч. Проанализируй данные Марии и Виктории.
    Все суммы в кронах (kr).
    
    РАСХОДЫ (пользователь-категория: сумма):
    ${JSON.stringify(expenseSummary, null, 2)}
    
    НАКОПЛЕНИЯ (Wise): ${totalSavings} kr
    
    ЗАДАЧА:
    1. Похвали за дисциплину.
    2. Найди 2 области для экономии.
    3. Дай 3 совета на русском языке. Будь кратким.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "ИИ не смог ответить.";
  } catch (error: any) {
    console.error('Gemini error:', error);
    if (error.message?.includes('API key not valid')) {
      return "❌ Неверный API ключ. Проверьте его в настройках.";
    }
    return "AI временно недоступен. Проверьте интернет или ключ.";
  }
};
