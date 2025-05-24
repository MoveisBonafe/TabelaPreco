import { useState, useEffect } from 'react';
import { Catalog } from '@/pages/catalog';
import { Admin } from '@/pages/admin';
import { LoginModal } from '@/components/modals/login-modal';
import { useToast } from '@/components/ui/toast';
import { useSupabaseProducts } from '@/hooks/use-supabase-products';
import { auth } from '@/lib/auth';

type View = 'login' | 'catalog' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const { showToast, ToastContainer } = useToast();
  const { isConnected } = useSupabaseProducts();
  
  // Log para debug
  useEffect(() => {
    console.log('🌐 GitHub Pages - usando apenas Supabase');
    console.log('🔗 Supabase configurado:', !!import.meta.env.VITE_SUPABASE_URL);
  }, []);

  useEffect(() => {
    // Verifica se já está logado ao carregar a página
    if (auth.isAuthenticated()) {
      setCurrentView('admin');
    } else {
      setCurrentView('login');
    }
  }, []);

  const handleLogin = (username: string, password: string) => {
    if (auth.login(username, password)) {
      setCurrentView('admin');
      showToast('Login realizado com sucesso!');
    } else {
      showToast('Credenciais inválidas', 'error');
    }
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentView('login');
    showToast('Logout realizado com sucesso!');
  };

  const handleGoToCatalog = () => {
    setCurrentView('catalog');
  };

  const handleGoToAdmin = () => {
    if (auth.isAuthenticated()) {
      setCurrentView('admin');
    } else {
      setCurrentView('login');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'login' && (
        <LoginModal
          isVisible={true}
          onLogin={handleLogin}
          onClose={() => setCurrentView('catalog')}
        />
      )}

      {currentView === 'catalog' && (
        <Catalog 
          onGoToAdmin={handleGoToAdmin}
        />
      )}

      {currentView === 'admin' && (
        <Admin 
          onLogout={handleLogout}
          onGoToCatalog={handleGoToCatalog}
        />
      )}

      <ToastContainer />
      
      {/* Status de conexão para debug */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className={`px-3 py-1 rounded-full text-xs ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? '🟢 Supabase' : '🔴 Desconectado'}
        </div>
      </div>
    </div>
  );
}

export default App;