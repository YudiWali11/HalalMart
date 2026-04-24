import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['Accept'] = 'application/json';

export interface Category {
  id: string;
  name: string;
  type: 'masuk' | 'keluar';
  createdAt?: string;
  created_at?: string;
}

export interface Transaction {
  id: string;
  name: string;
  date: string;
  categoryId: string;
  amount: number;
  notes: string;
  type: 'masuk' | 'keluar';
  receipt_url?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  updateCategory: (id: string, cat: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id'> | FormData) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction> | FormData) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  categories: [],
  addCategory: async () => {},
  updateCategory: async () => {},
  deleteCategory: async () => {},
  transactions: [],
  addTransaction: async () => {},
  updateTransaction: async () => {},
  deleteTransaction: async () => {},
});

// Normalisasi data dari API (snake_case) ke format React (camelCase)
// PostgreSQL mengembalikan kolom decimal sebagai string, maka amount harus di-parse ke number
function normalizeTransaction(t: any): Transaction {
  return {
    ...t,
    categoryId: t.category_id ?? t.categoryId ?? '',
    amount: parseFloat(t.amount) || 0,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // On mount: check if user is already logged in via session
  useEffect(() => {
    axios.get('/api/user')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // When user changes, fetch or clear data
  useEffect(() => {
    if (user) {
      axios.get('/api/categories').then(res => setCategories(res.data)).catch(console.error);
      axios.get('/api/transactions').then(res => {
        setTransactions(res.data.map(normalizeTransaction));
      }).catch(console.error);
    } else {
      setCategories([]);
      setTransactions([]);
    }
  }, [user]);

  /**
   * Login: get CSRF cookie first, then POST credentials.
   * On success, sets user state → triggers data fetch.
   */
  const login = async (email: string, password: string) => {
    const res = await axios.post('/api/login', { email, password });
    setUser(res.data.user);
  };

  /**
   * Register: creates account only, does NOT auto-login.
   * Frontend should redirect to login page after success.
   */
  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    await axios.post('/api/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    // Don't setUser here - user must login separately
  };

  /**
   * Logout: invalidate session on server, then clear local state.
   * Always clears user even if server call fails.
   */
  const logout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const addCategory = async (cat: Omit<Category, 'id' | 'createdAt'>) => {
    const newCat = {
      ...cat,
      id: `c${Date.now()}`,
    };
    try {
      const res = await axios.post('/api/categories', newCat);
      setCategories(prev => [...prev, res.data]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateCategory = async (id: string, cat: Partial<Category>) => {
    try {
      const res = await axios.put(`/api/categories/${id}`, cat);
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...res.data } : c));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await axios.delete(`/api/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id'> | FormData) => {
    const payload: FormData | Record<string, unknown> = t instanceof FormData
      ? t
      : { ...t, category_id: (t as Omit<Transaction, 'id'>).categoryId };

    try {
      const res = await axios.post('/api/transactions', payload);
      setTransactions(prev => [...prev, normalizeTransaction(res.data)]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateTransaction = async (id: string, t: Partial<Transaction> | FormData) => {
    const url = `/api/transactions/${id}`;

    try {
      if (t instanceof FormData) {
        if (!t.has('_method')) t.append('_method', 'PUT');
        const res = await axios.post(url, t);
        setTransactions(prev => prev.map(tr => tr.id === id ? normalizeTransaction(res.data) : tr));
      } else {
        const payload: Record<string, unknown> = {
          ...t,
          ...(t.categoryId ? { category_id: t.categoryId } : {}),
        };
        const res = await axios.put(url, payload);
        setTransactions(prev => prev.map(tr => tr.id === id ? normalizeTransaction(res.data) : tr));
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await axios.delete(`/api/transactions/${id}`);
      setTransactions(prev => prev.filter(tr => tr.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      user, loading, login, register, logout,
      categories, addCategory, updateCategory, deleteCategory,
      transactions, addTransaction, updateTransaction, deleteTransaction,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
