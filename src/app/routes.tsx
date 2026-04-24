import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { KategoriPage } from './pages/KategoriPage';
import { TransaksiMasukPage } from './pages/TransaksiMasukPage';
import { TransaksiKeluarPage } from './pages/TransaksiKeluarPage';
import { ExportPDFPage } from './pages/ExportPDFPage';

export const router = createBrowserRouter([
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: () => <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', Component: DashboardPage },
      { path: 'kategori', Component: KategoriPage },
      { path: 'transaksi-masuk', Component: TransaksiMasukPage },
      { path: 'transaksi-keluar', Component: TransaksiKeluarPage },
      { path: 'export-pdf', Component: ExportPDFPage },
    ],
  },
  { path: '*', Component: () => <Navigate to="/login" replace /> },
]);
