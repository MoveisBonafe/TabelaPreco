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
    // Check if user is already authenticated
    if (auth.isAuthenticated()) {
      setCurrentView('admin');
    } else {
      setCurrentView('login'); // Sempre mostra login primeiro
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
