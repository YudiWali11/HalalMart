import { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Tags, X, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useApp, Category } from '../context/AppContext';

const ROWS_PER_PAGE = 10;

type SortKey = 'name' | 'type' | 'createdAt' | 'created_at';

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <AnimatePresence>
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
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800"
        >
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, name }: {
  open: boolean; onClose: () => void; onConfirm: () => void; name: string;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
        </div>
        <h3 className="text-gray-900 dark:text-white mb-2">Hapus Kategori?</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Apakah Anda yakin ingin menghapus kategori <strong className="text-gray-900 dark:text-white">"{name}"</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Batal
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm transition-colors">
            Hapus
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function KategoriPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | 'masuk' | 'keluar'>('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', type: 'masuk' as 'masuk' | 'keluar' });
  const [formError, setFormError] = useState('');

  // Confirm delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...categories];
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter) list = list.filter(c => c.type === typeFilter);
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const valA = String(a[sortKey] || (sortKey === 'createdAt' ? a.created_at : '') || '');
      const valB = String(b[sortKey] || (sortKey === 'createdAt' ? b.created_at : '') || '');
      return valA.localeCompare(valB) * dir;
    });
    return list;
  }, [categories, search, typeFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-emerald-500" /> : <ChevronDown className="w-3 h-3 text-emerald-500" />;
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ name: '', type: 'masuk' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({ name: cat.name, type: cat.type });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Nama kategori wajib diisi'); return; }
    try {
      if (editId) {
        await updateCategory(editId, { name: form.name.trim(), type: form.type });
        toast.success('Kategori berhasil diperbarui');
      } else {
        await addCategory({ name: form.name.trim(), type: form.type });
        toast.success('Kategori berhasil ditambahkan');
      }
      setModalOpen(false);
      setPage(1);
    } catch (err) {
      toast.error('Gagal menyimpan kategori. Silakan coba lagi.');
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteCategory(deleteId);
      toast.success('Kategori berhasil dihapus');
    }
    setConfirmOpen(false);
    setDeleteId(null);
    if (page > Math.ceil((filtered.length - 1) / ROWS_PER_PAGE)) setPage(p => Math.max(1, p - 1));
  };

  const deleteName = deleteId ? categories.find(c => c.id === deleteId)?.name || '' : '';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-gray-900 dark:text-white">Kelola Kategori</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{categories.length} kategori terdaftar</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kategori..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {(['', 'masuk', 'keluar'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setPage(1); }}
                className={`px-3 py-2 rounded-xl text-sm transition-all ${typeFilter === t
                  ? t === 'masuk' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : t === 'keluar' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {t === '' ? 'Semua' : t === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-5 py-3.5">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    Nama Kategori <SortIcon k="name" />
                  </button>
                </th>
                <th className="text-left px-5 py-3.5">
                  <button onClick={() => toggleSort('type')} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    Jenis <SortIcon k="type" />
                  </button>
                </th>
                <th className="text-left px-5 py-3.5">
                  <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    Tanggal Dibuat <SortIcon k="createdAt" />
                  </button>
                </th>
                <th className="text-right px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <Tags className="w-7 h-7 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada kategori</p>
                        <button onClick={openAdd} className="text-emerald-600 dark:text-emerald-400 text-sm hover:underline">
                          + Tambah kategori pertama
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : paginated.map((cat, i) => (
                  <motion.tr
                    key={cat.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${
                          cat.type === 'masuk' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'
                        }`}>
                          {cat.type === 'masuk' ? '↓' : '↑'}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs ${
                        cat.type === 'masuk'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                      }`}>
                        {cat.type === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {(() => {
                        const dateStr = cat.createdAt || cat.created_at;
                        if (!dateStr) return '-';
                        try {
                          return format(parseISO(dateStr), 'd MMM yyyy', { locale: id });
                        } catch (e) {
                          return '-';
                        }
                      })()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cat.id)}
                          className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {paginated.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Tags className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada kategori</p>
            </div>
          ) : paginated.map(cat => (
            <div key={cat.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                cat.type === 'masuk' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'
              }`}>
                {cat.type === 'masuk' ? '↓' : '↑'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">{cat.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {cat.type === 'masuk' ? 'Pemasukan' : 'Pengeluaran'} · {(() => {
                    const dateStr = cat.createdAt || cat.created_at;
                    if (!dateStr) return '-';
                    try {
                      return format(parseISO(dateStr), 'd MMM yyyy', { locale: id });
                    } catch (e) {
                      return '-';
                    }
                  })()}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDeleteClick(cat.id)} className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Menampilkan {Math.min((page - 1) * ROWS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ROWS_PER_PAGE, filtered.length)} dari {filtered.length} kategori
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  ← Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs transition-colors ${page === i + 1 ? 'bg-emerald-500 text-white' : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    {i + 1}
                  </button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-gray-900 dark:text-white">{editId ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{editId ? 'Perbarui data kategori' : 'Tambahkan kategori baru'}</p>
            </div>
            <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">Nama Kategori</label>
              <input
                type="text"
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormError(''); }}
                placeholder="Contoh: Penjualan Produk"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all ${
                  formError ? 'border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30' : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30'
                }`}
              />
              {formError && <p className="mt-1 text-xs text-rose-500">{formError}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">Jenis Kategori</label>
              <div className="grid grid-cols-2 gap-2">
                {(['masuk', 'keluar'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`py-2.5 rounded-xl text-sm border transition-all ${
                      form.type === t
                        ? t === 'masuk'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                          : 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {t === 'masuk' ? '↓ Pemasukan' : '↑ Pengeluaran'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Batal
            </button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm transition-all shadow-lg shadow-emerald-500/20">
              {editId ? 'Simpan Perubahan' : 'Tambahkan'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        name={deleteName}
      />
    </div>
  );
}
