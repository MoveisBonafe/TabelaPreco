import { Box, Store, LogOut, Grid3X3, List, User } from 'lucide-react';
import { auth } from '@/lib/auth';

interface NavbarProps {
  isAdmin?: boolean;
  onLogout?: () => void;
  viewMode?: 'grid' | 'list';
  onToggleViewMode?: () => void;
}

export function Navbar({ 
  isAdmin, 
  onLogout,
  viewMode = 'grid',
  onToggleViewMode 
}: NavbarProps) {
  const currentUser = auth.getUser();
  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              {isAdmin ? (
                <Box className="text-white text-sm" />
              ) : (
                <Store className="text-white text-sm" />
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-800">
              {isAdmin ? 'Admin Panel' : 'Catálogo de Produtos'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAdmin ? (
              <>
                {/* Botão Ver Público removido - login obrigatório */}
                <button 
                  onClick={onLogout}
                  className="text-slate-600 hover:text-red-600 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Sair</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={onToggleViewMode}
                  className="text-slate-600 hover:text-blue-600 transition-colors duration-200"
                >
                  {viewMode === 'grid' ? (
                    <Grid3X3 className="h-4 w-4" />
                  ) : (
                    <List className="h-4 w-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">
                    {viewMode === 'grid' ? 'Grid' : 'Lista'}
                  </span>
                </button>
                {/* Botão Admin removido - login obrigatório */}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
