import { useState, useEffect } from 'react';
import { Catalog } from '@/pages/catalog';
import { Admin } from '@/pages/admin';
import { LoginModal } from '@/components/modals/login-modal';
import { useToast } from '@/components/ui/toast';
import { auth } from '@/lib/auth';

type View = 'login' | 'catalog' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    // Limpeza completa de dados antigos no localStorage
    const keysToRemove = [
      'catalog-products', 
      'catalog-categories', 
      'catalog-data',
      'catalog-products-v1',
      'catalog-categories-v1',
      'catalog-settings',
      'catalog-users'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Força limpeza de qualquer cache antigo
    if (localStorage.getItem('catalog-version') !== '2.0') {
      localStorage.clear();
      localStorage.setItem('catalog-version', '2.0');
    }
    
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
    <div className="min-h-screen">
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
  );
}

export default App;
