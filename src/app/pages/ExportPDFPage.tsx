import { useState, useMemo } from 'react';
import { FileText, Download, Eye, Printer, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO, subDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

const fmt = (n: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n);

type ReportType = 'semua' | 'masuk' | 'keluar';

export function ExportPDFPage() {
  const { transactions, categories, user } = useApp();

  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reportType, setReportType] = useState<ReportType>('semua');
  const [catFilter, setCatFilter] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (t.date < dateFrom || t.date > dateTo) return false;
      if (catFilter && t.categoryId !== catFilter) return false;
      if (reportType === 'masuk' && t.type !== 'masuk') return false;
      if (reportType === 'keluar' && t.type !== 'keluar') return false;
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions, dateFrom, dateTo, catFilter, reportType]);

  const masukList = filtered.filter(t => t.type === 'masuk');
  const keluarList = filtered.filter(t => t.type === 'keluar');
  const totalMasuk = masukList.reduce((s, t) => s + t.amount, 0);
  const totalKeluar = keluarList.reduce((s, t) => s + t.amount, 0);
  const saldo = totalMasuk - totalKeluar;

  const handlePreview = () => {
    if (!dateFrom || !dateTo) { toast.error('Pilih rentang tanggal terlebih dahulu'); return; }
    setShowPreview(true);
    toast.success('Preview laporan siap');
  };

  const fmtPrint = (n: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n);

  const buildMasukRows = () => (reportType === 'masuk' || reportType === 'semua') && masukList.length > 0 ? `
    <div class="section">
      <div class="section-title masuk-title"><span class="dot dot-masuk"></span>Transaksi Pemasukan</div>
      <table>
        <thead><tr class="thead-masuk"><th>Tanggal</th><th>Nama Transaksi</th><th>Kategori</th><th class="text-right">Nominal</th></tr></thead>
        <tbody>
          ${masukList.map((t, i) => {
            const cat = categories.find(c => c.id === t.categoryId);
            const dateStr = format(parseISO(t.date), 'd MMM yyyy', { locale: idLocale });
            return `<tr class="${i % 2 === 1 ? 'row-alt-masuk' : ''}"><td>${dateStr}</td><td>${t.name}</td><td>${cat?.name ?? '-'}</td><td class="text-right amount-masuk">${fmtPrint(t.amount)}</td></tr>`;
          }).join('')}
          <tr class="total-masuk"><td colspan="3" class="text-right">Total Pemasukan</td><td class="text-right">${fmtPrint(totalMasuk)}</td></tr>
        </tbody>
      </table>
    </div>` : '';

  const buildKeluarRows = () => (reportType === 'keluar' || reportType === 'semua') && keluarList.length > 0 ? `
    <div class="section">
      <div class="section-title keluar-title"><span class="dot dot-keluar"></span>Transaksi Pengeluaran</div>
      <table>
        <thead><tr class="thead-keluar"><th>Tanggal</th><th>Nama Transaksi</th><th>Kategori</th><th class="text-right">Nominal</th></tr></thead>
        <tbody>
          ${keluarList.map((t, i) => {
            const cat = categories.find(c => c.id === t.categoryId);
            const dateStr = format(parseISO(t.date), 'd MMM yyyy', { locale: idLocale });
            return `<tr class="${i % 2 === 1 ? 'row-alt-keluar' : ''}"><td>${dateStr}</td><td>${t.name}</td><td>${cat?.name ?? '-'}</td><td class="text-right amount-keluar">${fmtPrint(t.amount)}</td></tr>`;
          }).join('')}
          <tr class="total-keluar"><td colspan="3" class="text-right">Total Pengeluaran</td><td class="text-right">${fmtPrint(totalKeluar)}</td></tr>
        </tbody>
      </table>
    </div>` : '';

  const handlePrint = () => {
    if (!showPreview) { toast.error('Harap preview laporan terlebih dahulu'); return; }

    const dateLabel = `${format(parseISO(dateFrom), 'd MMM yyyy', { locale: idLocale })} – ${format(parseISO(dateTo), 'd MMM yyyy', { locale: idLocale })}`;
    const saldoColor = saldo >= 0 ? '#059669' : '#e11d48';
    const saldoLabel = saldo >= 0 ? '✓ Surplus' : '✗ Defisit';
    const badgeBg    = saldo >= 0 ? '#10b981' : '#f43f5e';
    const printedAt  = format(new Date(), 'd MMMM yyyy, HH:mm', { locale: idLocale });

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Laporan Arus Kas – HalalMart</title>
  <style>
    @page { size: A4 portrait; margin: 14mm 16mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #111; background: #fff; }

    /* ── Header ── */
    .header { background: linear-gradient(135deg, #059669, #0f766e); color: #fff; padding: 20px 24px; border-radius: 10px 10px 0 0; display: flex; justify-content: space-between; align-items: center; }
    .brand  { display: flex; align-items: center; gap: 10px; }
    .brand-icon { width: 36px; height: 36px; background: rgba(255,255,255,.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .brand-name { font-size: 20px; font-weight: 700; }
    .brand-sub  { font-size: 10px; opacity: .8; margin-top: 2px; }
    .report-info { text-align: right; }
    .report-title { font-size: 15px; font-weight: 700; }
    .report-date  { font-size: 10px; opacity: .8; margin-top: 3px; }

    /* ── Meta ── */
    .meta { display: flex; gap: 20px; font-size: 10px; color: #6b7280; padding: 10px 0; border-bottom: 1px solid #e5e7eb; margin-bottom: 16px; }

    /* ── Summary cards ── */
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
    .card { border-radius: 8px; padding: 12px 14px; }
    .card-masuk  { background: #ecfdf5; border: 1px solid #a7f3d0; }
    .card-keluar { background: #fff1f2; border: 1px solid #fecdd3; }
    .card-saldo  { background: #f5f3ff; border: 1px solid #ddd6fe; }
    .card-label  { font-size: 10px; font-weight: 600; margin-bottom: 4px; }
    .card-masuk  .card-label { color: #065f46; }
    .card-keluar .card-label { color: #9f1239; }
    .card-saldo  .card-label { color: #4c1d95; }
    .card-amount { font-size: 14px; font-weight: 700; }
    .card-masuk  .card-amount { color: #047857; }
    .card-keluar .card-amount { color: #be123c; }
    .card-saldo  .card-amount { color: #5b21b6; }
    .card-count  { font-size: 9px; margin-top: 3px; color: #9ca3af; }

    /* ── Section ── */
    .section { margin-bottom: 20px; }
    .section-title { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #111; margin-bottom: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .dot-masuk  { background: #10b981; }
    .dot-keluar { background: #f43f5e; }
    .masuk-title { color: #065f46; }
    .keluar-title { color: #9f1239; }

    /* ── Table ── */
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 7px 10px; text-align: left; font-size: 11px; }
    th { font-weight: 600; font-size: 10px; }
    .text-right { text-align: right; }
    .amount-masuk  { color: #047857; font-weight: 600; }
    .amount-keluar { color: #be123c; font-weight: 600; }
    .thead-masuk  th { background: #ecfdf5; color: #065f46; }
    .thead-keluar th { background: #fff1f2; color: #9f1239; }
    .row-alt-masuk  { background: #f0fdf4; }
    .row-alt-keluar { background: #fff1f2; }
    .total-masuk  { background: #d1fae5; font-weight: 700; color: #065f46; border-top: 2px solid #6ee7b7; }
    .total-keluar { background: #ffe4e6; font-weight: 700; color: #9f1239; border-top: 2px solid #fca5a5; }
    .total-masuk  td, .total-keluar td { font-weight: 700; font-size: 11px; }
    tbody tr:not(.total-masuk):not(.total-keluar) { border-bottom: 1px solid #f3f4f6; }

    /* ── Saldo box ── */
    .saldo-box { background: #1f2937; border-radius: 10px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
    .saldo-label { color: #d1d5db; font-size: 10px; margin-bottom: 4px; }
    .saldo-amount { color: #fff; font-size: 22px; font-weight: 800; }
    .saldo-badge { padding: 6px 14px; border-radius: 6px; font-size: 11px; font-weight: 700; color: #fff; background: ${badgeBg}; }

    /* ── Footer ── */
    .footer { text-align: center; font-size: 9px; color: #9ca3af; margin-top: 16px; padding-top: 10px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="brand-icon">✦</div>
      <div><div class="brand-name">HalalMart</div><div class="brand-sub">Sistem Arus Kas UMKM</div></div>
    </div>
    <div class="report-info">
      <div class="report-title">${reportTypeLabels[reportType]}</div>
      <div class="report-date">${dateLabel}</div>
    </div>
  </div>

  <div style="padding: 0 4px">
    <div class="meta">
      <span>Dicetak: ${printedAt} WIB</span>
      <span>Dibuat oleh: ${user?.name ?? 'Admin'}</span>
      <span>Total transaksi: ${filtered.length}</span>
    </div>

    <div class="summary">
      ${reportType === 'semua' || reportType === 'masuk' ? `
      <div class="card card-masuk">
        <div class="card-label">Total Pemasukan</div>
        <div class="card-amount">${fmtPrint(totalMasuk)}</div>
        <div class="card-count">${masukList.length} transaksi</div>
      </div>` : ''}
      ${reportType === 'semua' || reportType === 'keluar' ? `
      <div class="card card-keluar">
        <div class="card-label">Total Pengeluaran</div>
        <div class="card-amount">${fmtPrint(totalKeluar)}</div>
        <div class="card-count">${keluarList.length} transaksi</div>
      </div>` : ''}
      ${reportType === 'semua' ? `
      <div class="card card-saldo">
        <div class="card-label">Selisih Bersih</div>
        <div class="card-amount" style="color:${saldoColor}">${saldo >= 0 ? '+' : '-'}${fmtPrint(Math.abs(saldo))}</div>
        <div class="card-count">${saldo >= 0 ? 'Surplus' : 'Defisit'}</div>
      </div>` : ''}
    </div>

    ${buildMasukRows()}
    ${buildKeluarRows()}

    ${reportType === 'semua' ? `
    <div class="saldo-box">
      <div>
        <div class="saldo-label">Saldo Arus Kas Bersih</div>
        <div class="saldo-amount">${saldo >= 0 ? '+' : '-'}${fmtPrint(Math.abs(saldo))}</div>
      </div>
      <div class="saldo-badge">${saldoLabel}</div>
    </div>` : ''}

    <div class="footer">
      <p>Dokumen ini dibuat secara otomatis oleh sistem HalalMart</p>
      <p>© 2026 HalalMart – Platform Arus Kas UMKM</p>
    </div>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { toast.error('Pop-up diblokir browser. Izinkan pop-up untuk halaman ini.'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
    toast.success('Membuka dialog cetak / save PDF...');
  };

  const reportTypeLabels: Record<ReportType, string> = {
    semua: 'Semua Transaksi',
    masuk: 'Hanya Pemasukan',
    keluar: 'Hanya Pengeluaran',
  };

  const getReportDisplayName = () => {
    if (reportType === 'masuk') return 'Laporan Pemasukan';
    if (reportType === 'keluar') return 'Laporan Pengeluaran';
    return 'Laporan Arus Kas';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-gray-900 dark:text-white">Export Laporan PDF</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Buat dan unduh laporan arus kas profesional</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Filter Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-amber-500" />
              Pengaturan Laporan
            </h3>

            <div className="space-y-4">
              {/* Date range */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">Dari Tanggal</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30 transition-all" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">Sampai Tanggal</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30 transition-all" />
              </div>

              {/* Report type */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Jenis Laporan</label>
                <div className="space-y-2">
                  {(['semua', 'masuk', 'keluar'] as ReportType[]).map(t => (
                    <button key={t} onClick={() => setReportType(t)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all ${
                        reportType === t
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${reportType === t ? 'border-amber-500' : 'border-gray-300 dark:border-gray-600'}`}>
                        {reportType === t && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                      </div>
                      {reportTypeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category filter */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">Filter Kategori (opsional)</label>
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-amber-400 transition-colors">
                  <option value="">Semua Kategori</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type === 'masuk' ? 'Pemasukan' : 'Pengeluaran'})</option>)}
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 mt-6">
              <button onClick={handlePreview}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-sm hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all">
                <Eye className="w-4 h-4" />
                Preview Laporan
              </button>
              <button onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm shadow-lg shadow-amber-500/25 hover:-translate-y-0.5 transition-all duration-200">
                <Printer className="w-4 h-4" />
                Download / Cetak PDF
              </button>
            </div>
          </div>

          {/* Summary preview */}
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3"
            >
              <h4 className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Ringkasan Laporan
              </h4>
              <div className="space-y-2">
                {(reportType === 'semua' || reportType === 'masuk') && (
                  <div className={`flex items-center justify-between py-2 ${reportType === 'semua' ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Pemasukan</span>
                    </div>
                    <span className="text-sm text-emerald-600 dark:text-emerald-400" style={{ fontWeight: 600 }}>{fmt(totalMasuk)}</span>
                  </div>
                )}
                {(reportType === 'semua' || reportType === 'keluar') && (
                  <div className={`flex items-center justify-between py-2 ${reportType === 'semua' ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Pengeluaran</span>
                    </div>
                    <span className="text-sm text-rose-600 dark:text-rose-400" style={{ fontWeight: 600 }}>{fmt(totalKeluar)}</span>
                  </div>
                )}
                {reportType === 'semua' && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-3.5 h-3.5 text-violet-500" />
                      <span className="text-sm text-gray-900 dark:text-white">Selisih Bersih</span>
                    </div>
                    <span className={`text-sm ${saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} style={{ fontWeight: 700 }}>
                      {saldo >= 0 ? '+' : '-'}{fmt(Math.abs(saldo))}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                {filtered.length} transaksi · {format(parseISO(dateFrom), 'd MMM', { locale: idLocale })} – {format(parseISO(dateTo), 'd MMM yyyy', { locale: idLocale })}
              </p>
            </motion.div>
          )}
        </div>

        {/* Right: PDF Preview */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-amber-500" />
                Preview Laporan PDF
              </h3>
              {!showPreview && (
                <span className="text-xs text-gray-400 dark:text-gray-600">Klik "Preview" untuk melihat laporan</span>
              )}
            </div>

            <AnimatePresence>
              {!showPreview ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
                    <FileText className="w-10 h-10 text-amber-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Preview laporan belum tersedia</p>
                  <p className="text-gray-400 dark:text-gray-600 text-xs">Atur filter dan klik "Preview Laporan"</p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-auto"
                >
                  {/* PDF-like preview */}
                  <div id="pdf-preview-area" className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm print:shadow-none print:border-none" style={{ fontFamily: 'serif' }}>
                    {/* PDF Header */}
                    <div className="print-header bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs">✦</div>
                            <span className="text-white text-lg" style={{ fontWeight: 700 }}>HalalMart</span>
                          </div>
                          <p className="text-emerald-100 text-xs">Sistem Arus Kas UMKM</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-lg" style={{ fontWeight: 700 }}>{getReportDisplayName()}</p>
                          <p className="text-emerald-100 text-xs mt-1">
                            {format(parseISO(dateFrom), 'd MMM yyyy', { locale: idLocale })} – {format(parseISO(dateTo), 'd MMM yyyy', { locale: idLocale })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-8 py-6 space-y-6">
                      {/* Meta info */}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 border-b border-gray-100 pb-4">
                        <span>Dicetak: {format(new Date(), "d MMMM yyyy, HH:mm", { locale: idLocale })} WIB</span>
                        <span>Dibuat oleh: {user?.name}</span>
                        <span>Jenis: {reportTypeLabels[reportType]}</span>
                      </div>

                      {/* Summary cards */}
                      <div className={`grid ${reportType === 'semua' ? 'grid-cols-3' : 'grid-cols-1'} gap-3`}>
                        {(reportType === 'semua' || reportType === 'masuk') && (
                          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                            <p className="text-emerald-600 text-xs mb-1">Total Pemasukan</p>
                            <p className="text-emerald-800 text-sm" style={{ fontWeight: 700 }}>{fmt(totalMasuk)}</p>
                            <p className="text-emerald-500 text-xs">{masukList.length} transaksi</p>
                          </div>
                        )}
                        {(reportType === 'semua' || reportType === 'keluar') && (
                          <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                            <p className="text-rose-600 text-xs mb-1">Total Pengeluaran</p>
                            <p className="text-rose-800 text-sm" style={{ fontWeight: 700 }}>{fmt(totalKeluar)}</p>
                            <p className="text-rose-500 text-xs">{keluarList.length} transaksi</p>
                          </div>
                        )}
                        {reportType === 'semua' && (
                          <div className={`rounded-xl p-3 border ${saldo >= 0 ? 'bg-violet-50 border-violet-100' : 'bg-orange-50 border-orange-100'}`}>
                            <p className={`text-xs mb-1 ${saldo >= 0 ? 'text-violet-600' : 'text-orange-600'}`}>Selisih Bersih</p>
                            <p className={`text-sm ${saldo >= 0 ? 'text-violet-800' : 'text-orange-800'}`} style={{ fontWeight: 700 }}>{saldo >= 0 ? '+' : '-'}{fmt(Math.abs(saldo))}</p>
                            <p className={`text-xs ${saldo >= 0 ? 'text-violet-400' : 'text-orange-400'}`}>{saldo >= 0 ? 'Surplus' : 'Defisit'}</p>
                          </div>
                        )}
                      </div>

                      {/* Masuk table */}
                      {(reportType === 'masuk' || reportType === 'semua') && masukList.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <h4 className="text-sm text-gray-900" style={{ fontWeight: 600 }}>Transaksi Pemasukan</h4>
                          </div>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-emerald-50">
                                <th className="text-left px-3 py-2 text-emerald-800 rounded-l-lg">Tanggal</th>
                                <th className="text-left px-3 py-2 text-emerald-800">Nama Transaksi</th>
                                <th className="text-left px-3 py-2 text-emerald-800">Kategori</th>
                                <th className="text-right px-3 py-2 text-emerald-800 rounded-r-lg">Nominal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {masukList.map((t, i) => {
                                const cat = categories.find(c => c.id === t.categoryId);
                                return (
                                  <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'print-masuk-row bg-emerald-50'}>
                                    <td className="px-3 py-2 text-gray-600">{format(parseISO(t.date), 'd MMM yy', { locale: idLocale })}</td>
                                    <td className="px-3 py-2 text-gray-800">{t.name}</td>
                                    <td className="px-3 py-2 text-gray-600">{cat?.name}</td>
                                    <td className="px-3 py-2 text-right text-emerald-700" style={{ fontWeight: 600 }}>{fmt(t.amount)}</td>
                                  </tr>
                                );
                              })}
                              <tr className="print-total-masuk border-t-2 border-emerald-200 bg-emerald-50">
                                <td colSpan={3} className="px-3 py-2 text-emerald-800 text-right" style={{ fontWeight: 700 }}>Total Pemasukan</td>
                                <td className="px-3 py-2 text-right text-emerald-800" style={{ fontWeight: 700 }}>{fmt(totalMasuk)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Keluar table */}
                      {(reportType === 'keluar' || reportType === 'semua') && keluarList.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                            <h4 className="text-sm text-gray-900" style={{ fontWeight: 600 }}>Transaksi Pengeluaran</h4>
                          </div>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-rose-50">
                                <th className="text-left px-3 py-2 text-rose-800 rounded-l-lg">Tanggal</th>
                                <th className="text-left px-3 py-2 text-rose-800">Nama Transaksi</th>
                                <th className="text-left px-3 py-2 text-rose-800">Kategori</th>
                                <th className="text-right px-3 py-2 text-rose-800 rounded-r-lg">Nominal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {keluarList.map((t, i) => {
                                const cat = categories.find(c => c.id === t.categoryId);
                                return (
                                  <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'print-keluar-row bg-rose-50'}>
                                    <td className="px-3 py-2 text-gray-600">{format(parseISO(t.date), 'd MMM yy', { locale: idLocale })}</td>
                                    <td className="px-3 py-2 text-gray-800">{t.name}</td>
                                    <td className="px-3 py-2 text-gray-600">{cat?.name}</td>
                                    <td className="px-3 py-2 text-right text-rose-700" style={{ fontWeight: 600 }}>{fmt(t.amount)}</td>
                                  </tr>
                                );
                              })}
                              <tr className="print-total-keluar border-t-2 border-rose-200 bg-rose-50">
                                <td colSpan={3} className="px-3 py-2 text-rose-800 text-right" style={{ fontWeight: 700 }}>Total Pengeluaran</td>
                                <td className="px-3 py-2 text-right text-rose-800" style={{ fontWeight: 700 }}>{fmt(totalKeluar)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Final summary */}
                      {reportType === 'semua' && (
                        <div className="print-saldo bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-300 text-xs mb-1">Saldo Arus Kas Bersih</p>
                              <p className="text-2xl" style={{ fontWeight: 800 }}>{saldo >= 0 ? '+' : '-'}{fmt(Math.abs(saldo))}</p>
                            </div>
                            <div className={`${saldo >= 0 ? 'print-surplus bg-emerald-500' : 'print-defisit bg-rose-500'} px-3 py-1.5 rounded-lg text-sm`} style={{ fontWeight: 600 }}>
                              {saldo >= 0 ? '✓ Surplus' : '✗ Defisit'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
                        <p>Dokumen ini dibuat secara otomatis oleh sistem HalalMart</p>
                        <p>© 2026 HalalMart – Platform Arus Kas UMKM</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Print styles — A4 ready, dark mode safe */}

    </div>
  );
}
