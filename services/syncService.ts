
import { Transaction, Plan } from '../types.ts';

const BASE_URL = 'https://api.keyvalue.xyz';

export interface SyncData {
  transactions: Transaction[];
  plans: Plan[];
  wiseBalance: number;
  goal: number;
  lastUpdated: string;
}

export const syncService = {
  pull: async (syncKey: string): Promise<SyncData | null> => {
    try {
      const response = await fetch(`${BASE_URL}/${syncKey}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.error('Pull error:', e);
      return null;
    }
  },

  push: async (syncKey: string, data: SyncData): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/${syncKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (e) {
      console.error('Push error:', e);
      return false;
    }
  },

  createNewKey: async (): Promise<string> => {
    try {
      const response = await fetch(`${BASE_URL}/new`, { method: 'POST' });
      const keyUrl = await response.text();
      return keyUrl.split('/').pop() || '';
    } catch (e) {
      return Math.random().toString(36).substring(2, 15);
    }
  }
};
