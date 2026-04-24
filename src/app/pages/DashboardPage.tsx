import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Link } from 'react-router';
import { useState, useMemo, useEffect, useRef } from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { subDays } from 'date-fns';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Filter, RotateCcw, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

const fmt = (n: number) =>
  'Rp ' + new Intl.NumberFormat('id-ID').format(n);

function CountUp({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return <>{fmt(value)}</>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl p-3">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600 dark:text-gray-300">{p.name}:</span>
          <span className="text-gray-900 dark:text-white">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const DonutTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl p-3">
      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 rounded-full" style={{ background: payload[0].payload.fill }} />
        <span className="text-gray-700 dark:text-gray-300">{payload[0].name}:</span>
        <span className="text-gray-900 dark:text-white" style={{ fontWeight: 600 }}>{fmt(payload[0].value)}</span>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-4">{payload[0].payload.percent}% dari total</p>
    </div>
  );
};

export function DashboardPage() {
  const { transactions, categories, user } = useApp();
  const today = new Date();

  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [catFilter, setCatFilter] = useState('');

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const d = parseISO(t.date);
      const from = parseISO(dateFrom);
      const to = parseISO(dateTo);
      if (d < from || d > to) return false;
      if (catFilter && t.categoryId !== catFilter) return false;
      return true;
    });
  }, [transactions, dateFrom, dateTo, catFilter]);

  const totalMasuk = useMemo(() => filtered.filter(t => t.type === 'masuk').reduce((s, t) => s + t.amount, 0), [filtered]);
  const totalKeluar = useMemo(() => filtered.filter(t => t.type === 'keluar').reduce((s, t) => s + t.amount, 0), [filtered]);
  const saldo = totalMasuk - totalKeluar;

  // Monthly chart data
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr'];
    const monthMap: Record<string, { masuk: number; keluar: number }> = {
      '2026-01': { masuk: 0, keluar: 0 },
      '2026-02': { masuk: 0, keluar: 0 },
      '2026-03': { masuk: 0, keluar: 0 },
      '2026-04': { masuk: 0, keluar: 0 },
    };
    filtered.forEach(t => {
      const key = t.date.slice(0, 7);
      if (monthMap[key]) {
        if (t.type === 'masuk') monthMap[key].masuk += t.amount;
        else monthMap[key].keluar += t.amount;
      }
    });
    return Object.entries(monthMap).map(([key, val], i) => ({
      name: months[i],
      Pemasukan: val.masuk,
      Pengeluaran: val.keluar,
    }));
  }, [filtered]);

  // Daily chart (last 14 days)
  const dailyData = useMemo(() => {
    const days: Record<string, { masuk: number; keluar: number }> = {};
    filtered.forEach(t => {
      if (!days[t.date]) days[t.date] = { masuk: 0, keluar: 0 };
      if (t.type === 'masuk') days[t.date].masuk += t.amount;
      else days[t.date].keluar += t.amount;
    });
    return Object.entries(days)
      .sort((a, b) => String(a[0] || '').localeCompare(String(b[0] || '')))
      .slice(-14)
      .map(([date, val]) => ({
        name: format(parseISO(date), 'd MMM', { locale: id }),
        Pemasukan: val.masuk,
        Pengeluaran: val.keluar,
      }));
  }, [filtered]);

  // Category breakdown for donut
  const DONUT_COLORS_KELUAR = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6'];
  const DONUT_COLORS_MASUK = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

  const catMasuk = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter(t => t.type === 'masuk').forEach(t => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
    });

    const sorted = Object.entries(map)
      .map(([catId, amt]) => ({
        name: categories.find(c => c.id === catId)?.name || 'Lainnya',
        Total: amt,
      }))
      .sort((a, b) => b.Total - a.Total);

    const top5 = sorted.slice(0, 5);
    const othersTotal = sorted.slice(5).reduce((s, x) => s + x.Total, 0);
    if (othersTotal > 0) top5.push({ name: 'Lainnya', Total: othersTotal });

    const total = top5.reduce((s, x) => s + x.Total, 0);
    return top5.map(x => ({
      ...x,
      percent: total > 0 ? Math.round((x.Total / total) * 100) : 0,
    }));
  }, [filtered, categories]);

  const catKeluar = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter(t => t.type === 'keluar').forEach(t => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
    });

    const sorted = Object.entries(map)
      .map(([catId, amt]) => ({
        name: categories.find(c => c.id === catId)?.name || 'Lainnya',
        Total: amt,
      }))
      .sort((a, b) => b.Total - a.Total);

    const top5 = sorted.slice(0, 5);
    const othersTotal = sorted.slice(5).reduce((s, x) => s + x.Total, 0);
    if (othersTotal > 0) top5.push({ name: 'Lainnya', Total: othersTotal });

    const total = top5.reduce((s, x) => s + x.Total, 0);
    return top5.map(x => ({
      ...x,
      percent: total > 0 ? Math.round((x.Total / total) * 100) : 0,
    }));
  }, [filtered, categories]);

  const recentTx = useMemo(() =>
    [...transactions].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 6),
    [transactions]
  );

  const resetFilter = () => {
    setDateFrom(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    setDateTo(format(new Date(), 'yyyy-MM-dd'));
    setCatFilter('');
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 17) return 'Selamat Siang';
    return 'Selamat Sore';
  };

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 p-6 lg:p-8"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
        <div className="absolute bottom-0 left-20 w-32 h-32 bg-teal-300/20 rounded-full translate-y-1/2 blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-emerald-100 text-sm mb-1">{greeting()},</p>
            <h2 className="text-white mb-1" style={{ fontWeight: 700, fontSize: '1.5rem' }}>{user?.name} 👋</h2>
            <p className="text-emerald-100 text-sm">
              {format(today, "EEEE, d MMMM yyyy", { locale: id })} · Pantau arus kas Anda hari ini
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
            <p className="text-emerald-100 text-xs mb-1">Saldo Bersih</p>
            <p className="text-white text-xl" style={{ fontWeight: 700 }}>
              {saldo >= 0 ? '+' : '-'}{fmt(Math.abs(saldo))}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <Filter className="w-4 h-4" />
            <span>Filter:</span>
          </div>
          <div className="flex flex-wrap gap-2 flex-1">
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition-colors"
            />
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition-colors"
            />
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="">Semua Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={resetFilter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pemasukan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-lg shadow-emerald-500/20"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-xl p-2">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                <ArrowUpRight className="w-3 h-3 text-emerald-100" />
                <span className="text-xs text-emerald-100">Masuk</span>
              </div>
            </div>
            <p className="text-emerald-100 text-sm mb-1">Total Pemasukan</p>
            <p className="text-white text-xl leading-tight" style={{ fontWeight: 700 }}>
              <CountUp target={totalMasuk} />
            </p>
            <p className="text-emerald-200 text-xs mt-1">{filtered.filter(t => t.type === 'masuk').length} transaksi</p>
          </div>
        </motion.div>

        {/* Pengeluaran */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 shadow-lg shadow-rose-500/20"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-xl p-2">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                <ArrowDownRight className="w-3 h-3 text-rose-100" />
                <span className="text-xs text-rose-100">Keluar</span>
              </div>
            </div>
            <p className="text-rose-100 text-sm mb-1">Total Pengeluaran</p>
            <p className="text-white text-xl leading-tight" style={{ fontWeight: 700 }}>
              <CountUp target={totalKeluar} />
            </p>
            <p className="text-rose-200 text-xs mt-1">{filtered.filter(t => t.type === 'keluar').length} transaksi</p>
          </div>
        </motion.div>

        {/* Saldo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`relative overflow-hidden rounded-2xl p-5 shadow-lg ${saldo >= 0 ? 'bg-gradient-to-br from-violet-600 to-indigo-700 shadow-violet-500/20' : 'bg-gradient-to-br from-orange-500 to-red-600 shadow-orange-500/20'}`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-xl p-2">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className={`flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5`}>
                {saldo >= 0
                  ? <ArrowUpRight className="w-3 h-3 text-violet-100" />
                  : <ArrowDownRight className="w-3 h-3 text-orange-100" />
                }
                <span className="text-xs text-white/80">{saldo >= 0 ? 'Surplus' : 'Defisit'}</span>
              </div>
            </div>
            <p className="text-white/70 text-sm mb-1">Saldo Bersih</p>
            <p className="text-white text-xl leading-tight" style={{ fontWeight: 700 }}>
              {saldo >= 0 ? '+' : '-'}<CountUp target={Math.abs(saldo)} />
            </p>
            <p className="text-white/60 text-xs mt-1">Pemasukan - Pengeluaran</p>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 1: Area charts with gradient */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-gray-900 dark:text-white">Tren Harian</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pemasukan vs Pengeluaran per hari</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 rounded inline-block" /> Masuk</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-rose-500 rounded inline-block" /> Keluar</span>
            </div>
          </div>
          {dailyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">Tidak ada data</div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradMasukDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradKeluarDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="currentColor" className="opacity-40" />
                <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="opacity-40" tickFormatter={v => `${(v/1000000).toFixed(0)}jt`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Pemasukan" stroke="#10b981" strokeWidth={2.5} fill="url(#gradMasukDaily)" dot={false} activeDot={{ r: 5, fill: '#10b981' }} />
                <Area type="monotone" dataKey="Pengeluaran" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gradKeluarDaily)" dot={false} activeDot={{ r: 5, fill: '#f43f5e' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-gray-900 dark:text-white">Tren Bulanan</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pemasukan vs Pengeluaran per bulan</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 rounded inline-block" /> Masuk</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-rose-500 rounded inline-block" /> Keluar</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="gradMasukMonthly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradKeluarMonthly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="currentColor" className="opacity-40" />
              <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="opacity-40" tickFormatter={v => `${(v/1000000).toFixed(0)}jt`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Pemasukan" stroke="#10b981" strokeWidth={2.5} fill="url(#gradMasukMonthly)" dot={{ fill: '#10b981', strokeWidth: 0, r: 5 }} activeDot={{ r: 7, fill: '#10b981' }} />
              <Area type="monotone" dataKey="Pengeluaran" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gradKeluarMonthly)" dot={{ fill: '#f43f5e', strokeWidth: 0, r: 5 }} activeDot={{ r: 7, fill: '#f43f5e' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts Row 2: Donut charts — breakdown kategori */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut Pengeluaran */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5"
        >
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h3 className="text-gray-900 dark:text-white">Breakdown Pengeluaran</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-4">Proporsi per kategori</p>
          </div>
          {catKeluar.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Tidak ada data</div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <ResponsiveContainer width={170} height={170}>
                  <PieChart>
                    <Pie
                      data={catKeluar}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="Total"
                      nameKey="name"
                      strokeWidth={0}
                    >
                      {catKeluar.map((entry, index) => (
                        <Cell key={`cell-keluar-${index}`} fill={DONUT_COLORS_KELUAR[index % DONUT_COLORS_KELUAR.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2.5 min-w-0">
                {catKeluar.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DONUT_COLORS_KELUAR[index % DONUT_COLORS_KELUAR.length] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{entry.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{entry.percent}%</span>
                      </div>
                      <div className="mt-0.5 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${entry.percent}%`, background: DONUT_COLORS_KELUAR[index % DONUT_COLORS_KELUAR.length] }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Donut Pemasukan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5"
        >
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-gray-900 dark:text-white">Breakdown Pemasukan</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-4">Proporsi per kategori</p>
          </div>
          {catMasuk.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Tidak ada data</div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <ResponsiveContainer width={170} height={170}>
                  <PieChart>
                    <Pie
                      data={catMasuk}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="Total"
                      nameKey="name"
                      strokeWidth={0}
                    >
                      {catMasuk.map((entry, index) => (
                        <Cell key={`cell-masuk-${index}`} fill={DONUT_COLORS_MASUK[index % DONUT_COLORS_MASUK.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2.5 min-w-0">
                {catMasuk.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DONUT_COLORS_MASUK[index % DONUT_COLORS_MASUK.length] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{entry.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{entry.percent}%</span>
                      </div>
                      <div className="mt-0.5 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${entry.percent}%`, background: DONUT_COLORS_MASUK[index % DONUT_COLORS_MASUK.length] }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-gray-900 dark:text-white">Transaksi Terbaru</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">6 transaksi terakhir</p>
          </div>
          <div className="flex gap-2">
            <Link to="/transaksi-masuk" className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
              Lihat semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
        <div className="space-y-2">
          {recentTx.map((t, i) => {
            const cat = categories.find(c => c.id === t.categoryId);
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.85 + i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                  t.type === 'masuk'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                }`}>
                  {t.type === 'masuk' ? '↓' : '↑'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white truncate">{t.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{cat?.name} · {format(parseISO(t.date), 'd MMM yyyy', { locale: id })}</p>
                </div>
                <p className={`text-sm shrink-0 ${t.type === 'masuk' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} style={{ fontWeight: 600 }}>
                  {t.type === 'masuk' ? '+' : '-'}{fmt(t.amount)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}