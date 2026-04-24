import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard, Tags, ArrowDownCircle, ArrowUpCircle,
  FileText, Menu, X, Sun, Moon, LogOut, ChevronDown, Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-emerald-500' },
  { to: '/kategori', icon: Tags, label: 'Kategori', color: 'text-violet-500' },
  { to: '/transaksi-masuk', icon: ArrowDownCircle, label: 'Transaksi Masuk', color: 'text-sky-500' },
  { to: '/transaksi-keluar', icon: ArrowUpCircle, label: 'Transaksi Keluar', color: 'text-rose-500' },
  { to: '/export-pdf', icon: FileText, label: 'Export PDF', color: 'text-amber-500' },
];

const pageTitles: Record<string, { label: string; desc: string }> = {
  '/dashboard': { label: 'Dashboard', desc: 'Ringkasan arus kas Anda' },
  '/kategori': { label: 'Kategori', desc: 'Kelola kategori transaksi' },
  '/transaksi-masuk': { label: 'Transaksi Masuk', desc: 'Daftar pemasukan' },
  '/transaksi-keluar': { label: 'Transaksi Keluar', desc: 'Daftar pengeluaran' },
  '/export-pdf': { label: 'Export PDF', desc: 'Laporan arus kas' },
};

export function Layout() {
  const { isDark, toggle } = useTheme();
  const { user, loading, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const title = pageTitles[location.pathname] || { label: 'HalalMart', desc: '' };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 left-0 h-full w-64 z-50 lg:hidden"
          >
            <div className="h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col shadow-2xl">
              <SidebarContent initials={initials} user={user} onClose={() => setMobileOpen(false)} onLogout={handleLogout} pathname={location.pathname} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (always visible) */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 sticky top-0 h-screen overflow-y-auto">
        <SidebarContent initials={initials} user={user} onClose={() => {}} onLogout={handleLogout} pathname={location.pathname} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 px-4 lg:px-6 h-16">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="flex-1">
              <h1 className="text-base lg:text-lg text-gray-900 dark:text-white leading-tight">{title.label}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{title.desc}</p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200" title={isDark ? 'Mode Terang' : 'Mode Gelap'}>
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>

              <div className="relative">
                <button onClick={() => setProfileOpen(o => !o)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs shrink-0">
                    {initials}
                  </div>
                  <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300 max-w-24 truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50"
                      onMouseLeave={() => setProfileOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                        <LogOut className="w-4 h-4" />
                        Keluar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 pb-6 overflow-x-hidden">
          <Outlet />
        </main>

        {/* Mobile bottom nav - REMOVED */}
      </div>
    </div>
  );
}

function SidebarContent({ initials, user, onClose, onLogout, pathname }: {
  initials: string;
  user: { name: string; email: string };
  onClose: () => void;
  onLogout: () => void;
  pathname: string;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 dark:text-white leading-tight" style={{ fontWeight: 700 }}>HalalMart</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-tight">Arus Kas UMKM</p>
        </div>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-gray-400 dark:text-gray-600 px-3 mb-3 uppercase tracking-wider">Menu Utama</p>
        {navItems.map(item => {
          const isActive = pathname === item.to;
          return (
            <NavLink key={item.to} to={item.to}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`}>
              <div className={`p-1.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-emerald-100 dark:bg-emerald-800/40'
                  : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
              }`}>
                <item.icon className={`w-4 h-4 ${isActive ? item.color : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`} />
              </div>
              <span className="text-sm flex-1">{item.label}</span>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          <button onClick={onLogout} className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors shrink-0" title="Keluar">
            <LogOut className="w-3.5 h-3.5 text-gray-400 hover:text-rose-500" />
          </button>
        </div>
      </div>
    </>
  );
}