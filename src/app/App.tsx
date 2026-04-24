import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors closeButton />
      </AppProvider>
    </ThemeProvider>
  );
}
