import { Box, Store, ExternalLink, LogOut, Shield, Grid3X3, List } from 'lucide-react';

interface NavbarProps {
  isAdmin?: boolean;
  onLogout?: () => void;
  onShowPublicView?: () => void;
  onShowAdminLogin?: () => void;
  viewMode?: 'grid' | 'list';
  onToggleViewMode?: () => void;
}

export function Navbar({ 
  isAdmin, 
  onLogout, 
  onShowPublicView, 
  onShowAdminLogin,
  viewMode = 'grid',
  onToggleViewMode 
}: NavbarProps) {
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
                <button 
                  onClick={onShowPublicView}
                  className="text-slate-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Ver Público</span>
                </button>
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
                <button 
                  onClick={onShowAdminLogin}
                  className="text-slate-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <Shield className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Admin</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
