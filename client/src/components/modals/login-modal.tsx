import { useState } from 'react';
import { ShieldX, User, Lock, LogIn, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginModalProps {
  onAdminLogin: (username: string, password: string) => void;
  onPublicView: () => void;
  isVisible: boolean;
}

export function LoginModal({ onAdminLogin, onPublicView, isVisible }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onAdminLogin(username, password);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldX className="text-white text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Acesso ao Sistema</h2>
          <p className="text-slate-600 mt-2">Faça login para acessar o catálogo</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Usuário</Label>
            <div className="relative">
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3"
                placeholder="Digite seu usuário"
              />
              <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Senha</Label>
            <div className="relative">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3"
                placeholder="Digite sua senha"
                autoComplete="current-password"
              />
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-3 hover:bg-blue-700 font-semibold"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}