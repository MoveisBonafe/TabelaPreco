import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NotFound from './pages/not-found';
import { Catalog } from '@/pages/catalog';
import { Admin } from '@/pages/admin';
import { LoginModal } from '@/components/modals/login-modal';
import { useToast } from '@/components/ui/toast';
import { auth } from '@/lib/auth';
import { Navbar } from './components/layout/navbar';
import { Toaster } from 'react-hot-toast'; // Assuming Toaster exists and is needed

import { useState, useEffect } from 'react';

type View = 'login' | 'catalog' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    // Verifica se já está logado ao carregar a página
    if (auth.isAuthenticated()) {
      setCurrentView('admin');
    } else {
      setCurrentView('login');
    }
  }, []);

  const handleAdminLogin = (username: string, password: string) => {
    if (auth.login(username, password)) {
      setCurrentView('admin');
      showToast('Login realizado com sucesso!');
    } else {
      showToast('Credenciais inválidas', 'error');
    }
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentView('catalog');
    showToast('Logout realizado com sucesso!');
  };

  const handleShowLogin = () => {
    setCurrentView('login');
  };

  const handleShowCatalog = () => {
    setCurrentView('catalog');
  };

  const handleShowAdmin = () => {
    if (auth.isAuthenticated()) {
      setCurrentView('admin');
    } else {
      setCurrentView('login');
    }
  };

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/catalog" replace />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Toaster />
        <div className="min-h-screen">
        {/* Keeping the original logic and rendering it conditionally inside the router based application. */}
          {currentView === 'login' && (
            <LoginModal
              onAdminLogin={handleAdminLogin}
              onPublicView={handleShowCatalog}
              isVisible={true}
            />
          )}

          {currentView === 'catalog' && (
            <Catalog onShowAdminLogin={handleShowLogin} />
          )}

          {currentView === 'admin' && (
            <Admin 
              onLogout={handleLogout}
              onShowPublicView={handleShowCatalog}
            />
          )}

          <ToastContainer />
        </div>
    </BrowserRouter>
  );
}

export default App;