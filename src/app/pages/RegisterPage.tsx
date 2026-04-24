import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function RegisterPage() {
  const { user, loading: authLoading, register } = useApp();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && user) navigate('/dashboard');
  }, [user, authLoading, navigate]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    setErrors(er => ({ ...er, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nama lengkap wajib diisi';
    if (!form.email) e.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Format email tidak valid';
    if (!form.password) e.password = 'Password wajib diisi';
    else if (form.password.length < 8) e.password = 'Password minimal 8 karakter';
    if (!form.confirm) e.confirm = 'Konfirmasi password wajib diisi';
    else if (form.confirm !== form.password) e.confirm = 'Password tidak cocok';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.confirm);
      toast.success('Pendaftaran berhasil! Silakan login dengan akun Anda. 🎉');
      navigate('/login');
    } catch (err: any) {
      if (err.response?.status === 422) {
        const serverErrors = err.response.data.errors || {};
        const flatErrors: Record<string, string> = {};
        for (const key in serverErrors) {
          flatErrors[key] = Array.isArray(serverErrors[key]) ? serverErrors[key][0] : serverErrors[key];
        }
        setErrors(flatErrors);
        toast.error('Gagal mendaftar. Periksa kembali data Anda.');
      } else {
        toast.error('Terjadi kesalahan saat mendaftar');
      }
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3;

  const strengthLabel = ['', 'Lemah', 'Cukup', 'Kuat'];
  const strengthColor = ['', 'bg-rose-400', 'bg-amber-400', 'bg-emerald-500'];

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all ${
      errors[field]
        ? 'border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30'
        : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30'
    }`;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-green-500">
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-white/20"
              style={{
                width: `${200 + i * 100}px`,
                height: `${200 + i * 100}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                borderRadius: `${30 + i * 10}%`,
                animation: `spin ${10 + i * 5}s linear infinite`,
              }}
            />
          ))}
        </div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-emerald-300/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 shadow-xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl text-white mb-4" style={{ fontWeight: 800 }}>Bergabung dengan HalalMart</h2>
          <p className="text-emerald-100 text-base leading-relaxed max-w-xs">
            Mulai perjalanan mengelola keuangan halal Anda dengan platform yang modern dan terpercaya.
          </p>

          <div className="mt-10 space-y-3 w-full max-w-xs">
            {[
              '✓ Gratis selamanya untuk UMKM',
              '✓ Laporan PDF profesional',
              '✓ Dashboard visual interaktif',
              '✓ Dark mode & Light mode',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 text-white text-sm text-left">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto relative">
        <button
          onClick={toggle}
          className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>

        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <p className="font-bold text-gray-900 dark:text-white text-xl">HalalMart</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="text-gray-900 dark:text-white mb-2" style={{ fontWeight: 700, fontSize: '1.75rem' }}>
              Buat Akun Baru
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Isi data di bawah untuk mendaftar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="Nama lengkap Anda"
                className={inputClass('name')}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="nama@email.com"
                className={inputClass('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 8 karakter"
                  className={inputClass('password') + ' pr-11'}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength meter */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwStrength ? strengthColor[pwStrength] : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Kekuatan: <span className={pwStrength === 1 ? 'text-rose-500' : pwStrength === 2 ? 'text-amber-500' : 'text-emerald-500'}>{strengthLabel[pwStrength]}</span></p>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="Ulangi password"
                  className={inputClass('confirm') + ' pr-11'}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.confirm && form.confirm === form.password && (
                <div className="mt-1 flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <p className="text-xs">Password cocok</p>
                </div>
              )}
              {errors.confirm && <p className="mt-1 text-xs text-rose-500">{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white transition-all duration-200 disabled:opacity-60 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Mendaftarkan...
                </span>
              ) : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
