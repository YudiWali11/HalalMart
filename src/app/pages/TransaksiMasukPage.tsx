import { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, ArrowDownCircle, X, ChevronUp, ChevronDown, RotateCcw, Image as ImageIcon, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useApp, Transaction } from '../context/AppContext';

const fmt = (n: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n);
const PAGE_SIZES = [10, 25, 50, 100];

type SortKey = 'date' | 'name' | 'amount';

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-800"
      >
        {children}
      </motion.div>
    </div>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, name }: { open: boolean; onClose: () => void; onConfirm: () => void; name: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-gray-800 p-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-rose-600" />
        </div>
        <h3 className="text-gray-900 dark:text-white mb-2">Hapus Transaksi?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Hapus transaksi <strong className="text-gray-900 dark:text-white">"{name}"</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Batal</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm transition-colors">Hapus</button>
        </div>
      </motion.div>
    </div>
  );
}

const emptyForm = { name: '', date: new Date().toISOString().split('T')[0], categoryId: '', amount: '', notes: '' };

export function TransaksiMasukPage() {
  const { transactions, categories, addTransaction, updateTransaction, deleteTransaction } = useApp();

  const masukCategories = categories.filter(c => c.type === 'masuk');
  const masukTx = transactions.filter(t => t.type === 'masuk');

  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const filtered = useMemo(() => {
    let list = [...masukTx];
    if (search) list = list.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || (t.notes || '').toLowerCase().includes(search.toLowerCase()));
    if (dateFrom) list = list.filter(t => t.date >= dateFrom);
    if (dateTo) list = list.filter(t => t.date <= dateTo);
    if (catFilter) list = list.filter(t => t.categoryId === catFilter);
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'amount') return (a.amount - b.amount) * dir;
      const valA = String(a[sortKey] || '');
      const valB = String(b[sortKey] || '');
      return valA.localeCompare(valB) * dir;
    });
    return list;
  }, [masukTx, search, dateFrom, dateTo, catFilter, sortKey, sortDir]);

  const totalNominalAll = useMemo(() => masukTx.reduce((s, t) => s + t.amount, 0), [masukTx]);
  const totalNominalFiltered = useMemo(() => filtered.reduce((s, t) => s + t.amount, 0), [filtered]);
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pageNominal = paginated.reduce((s, t) => s + t.amount, 0);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey !== k ? <ChevronUp className="w-3 h-3 opacity-30" /> :
    sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-emerald-500" /> : <ChevronDown className="w-3 h-3 text-emerald-500" />;

  const resetFilter = () => { setSearch(''); setDateFrom(''); setDateTo(''); setCatFilter(''); setPage(1); };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm, categoryId: masukCategories[0]?.id || '' });
    setFormErrors({});
    setReceiptFile(null);
    setModalOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditId(t.id);
    setForm({ name: t.name, date: t.date, categoryId: t.categoryId, amount: String(t.amount), notes: t.notes || '' });
    setFormErrors({});
    setReceiptFile(null);
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nama transaksi wajib diisi';
    if (!form.date) e.date = 'Tanggal wajib diisi';
    if (!form.categoryId) e.categoryId = 'Kategori wajib dipilih';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Nominal harus berupa angka positif';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const fd = new FormData();
    const id = editId || `t${Date.now()}`;
    fd.append('id', id);
    fd.append('name', form.name.trim());
    fd.append('date', form.date);
    fd.append('category_id', form.categoryId);
    fd.append('amount', form.amount);
    fd.append('notes', form.notes.trim());
    fd.append('type', 'masuk');
    if (receiptFile) fd.append('receipt', receiptFile);

    if (editId) {
      updateTransaction(editId, fd);
      toast.success('Transaksi masuk berhasil diperbarui');
    } else {
      addTransaction(fd);
      toast.success('Transaksi masuk berhasil ditambahkan');
    }
    setModalOpen(false);
    setPage(1);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) { deleteTransaction(deleteId); toast.success('Transaksi berhasil dihapus'); }
    setConfirmOpen(false); setDeleteId(null);
  };

  const deleteName = deleteId ? transactions.find(t => t.id === deleteId)?.name || '' : '';

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all ${
      formErrors[field] ? 'border-rose-400 focus:ring-2 focus:ring-rose-100' : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30'
    }`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <ArrowDownCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white">Transaksi Masuk</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{masukTx.length} total transaksi pemasukan</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Tambah Pemasukan
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-48 flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Cari transaksi..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-emerald-500 transition-colors" />
          </div>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition-colors" />
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition-colors" />
          <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition-colors">
            <option value="">Semua Kategori</option>
            {masukCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={resetFilter} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/40">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Total Transaksi</p>
          <p className="text-emerald-700 dark:text-emerald-300" style={{ fontWeight: 700 }}>{masukTx.length} transaksi</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/40">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Total Nominal</p>
          <p className="text-emerald-700 dark:text-emerald-300" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{fmt(totalNominalAll)}</p>
        </div>
        <div className="hidden sm:block bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/40">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Total Nominal Halaman Ini</p>
          <p className="text-emerald-700 dark:text-emerald-300" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{fmt(pageNominal)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-5 py-3.5">
                  <button onClick={() => toggleSort('date')} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 transition-colors">Tanggal <SortIcon k="date" /></button>
                </th>
                <th className="text-left px-5 py-3.5">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 transition-colors">Nama Transaksi <SortIcon k="name" /></button>
                </th>
                <th className="text-left px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">Kategori</th>
                <th className="text-right px-5 py-3.5">
                  <button onClick={() => toggleSort('amount')} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 transition-colors ml-auto">Nominal <SortIcon k="amount" /></button>
                </th>
                <th className="text-left px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">Catatan</th>
                <th className="text-center px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">Bukti</th>
                <th className="text-right px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                        <ArrowDownCircle className="w-7 h-7 text-emerald-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Tidak ada transaksi pemasukan</p>
                      <button onClick={openAdd} className="text-emerald-600 dark:text-emerald-400 text-sm hover:underline">+ Tambah transaksi pertama</button>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((t, i) => {
                const cat = categories.find(c => c.id === t.categoryId);
                return (
                  <motion.tr key={t.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {format(parseISO(t.date), 'd MMM yyyy', { locale: id })}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-900 dark:text-white">{t.name}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        {cat?.name || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm text-emerald-600 dark:text-emerald-400" style={{ fontWeight: 600 }}>+{fmt(t.amount)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 max-w-32 truncate">
                      {t.notes || <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {t.receipt_url ? (
                        <a href={t.receipt_url} target="_blank" rel="noopener noreferrer" className="group/img inline-block relative">
                          <img src={t.receipt_url} alt="Bukti" className="w-12 h-9 object-cover rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm group-hover/img:ring-2 group-hover/img:ring-emerald-500/30 transition-all" />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                            <ImageIcon className="w-3 h-3 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                          </div>
                        </a>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 transition-all" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setDeleteId(t.id); setConfirmOpen(true); }} className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-gray-400 hover:text-rose-600 transition-all" title="Hapus">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {paginated.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <ArrowDownCircle className="w-10 h-10 text-emerald-300" />
              <p className="text-gray-500 text-sm">Tidak ada transaksi</p>
            </div>
          ) : paginated.map(t => {
            const cat = categories.find(c => c.id === t.categoryId);
            return (
              <div key={t.id} className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0">↓</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-500">{cat?.name} · {format(parseISO(t.date), 'd MMM yyyy', { locale: id })}</p>
                  {t.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{t.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400" style={{ fontWeight: 600 }}>+{fmt(t.amount)}</p>
                  <div className="flex gap-1">
                    {t.receipt_url && <a href={t.receipt_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-emerald-100 text-gray-400 hover:text-emerald-600 transition-all"><ImageIcon className="w-3.5 h-3.5" /></a>}
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { setDeleteId(t.id); setConfirmOpen(true); }} className="p-1.5 rounded-lg hover:bg-rose-100 text-gray-400 hover:text-rose-600 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
            <div className="flex items-center gap-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {Math.min((page - 1) * pageSize + 1, filtered.length)}–{Math.min(page * pageSize, filtered.length)} dari {filtered.length}
              </p>
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none">
                {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / halaman</option>)}
              </select>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">← Prev</button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const p = i + Math.max(1, page - 2);
                  if (p > totalPages) return null;
                  return (
                    <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs transition-colors ${page === p ? 'bg-emerald-500 text-white' : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>{p}</button>
                  );
                })}
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Next →</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <ArrowDownCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white">{editId ? 'Edit' : 'Tambah'} Pemasukan</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Transaksi masuk</p>
              </div>
            </div>
            <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">Nama Transaksi</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Contoh: Penjualan Produk" className={inputClass('name')} />
              {formErrors.name && <p className="mt-1 text-xs text-rose-500">{formErrors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">Tanggal</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputClass('date')} />
                {formErrors.date && <p className="mt-1 text-xs text-rose-500">{formErrors.date}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">Kategori</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className={inputClass('categoryId')}>
                  <option value="">Pilih kategori</option>
                  {masukCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {formErrors.categoryId && <p className="mt-1 text-xs text-rose-500">{formErrors.categoryId}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">Nominal (Rp)</label>
              <input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" className={inputClass('amount')} />
              {form.amount && !isNaN(Number(form.amount)) && (
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{fmt(Number(form.amount))}</p>
              )}
              {formErrors.amount && <p className="mt-1 text-xs text-rose-500">{formErrors.amount}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">Catatan (opsional)</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Tambahkan catatan..." rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition-all resize-none" />
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">Bukti Gambar (opsional)</label>
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/30 dark:file:text-emerald-400" />
                {editId && transactions.find(t => t.id === editId)?.receipt_url && (
                  <a href={transactions.find(t => t.id === editId)?.receipt_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-emerald-600 hover:underline shrink-0">
                    <Eye className="w-3 h-3" /> Lihat Lama
                  </a>
                )}
              </div>
              <p className="mt-1 text-[10px] text-gray-400">Format: JPG, PNG (Maks 2MB)</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Batal</button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm transition-all shadow-lg shadow-emerald-500/20">
              {editId ? 'Simpan Perubahan' : 'Tambahkan'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDeleteConfirm} name={deleteName} />
    </div>
  );
}