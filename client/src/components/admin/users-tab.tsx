import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  username: string;
  password: string;
  priceLevel: 'basic' | 'vip';
  customMultiplier: number; // Multiplicador para o preço base (ex: 1.05 = +5%, 0.97 = -3%)
  permissions: {
    canEditProducts: boolean;
    canViewPrices: boolean;
    canEditPrices: boolean;
  };
}

export function UsersTab() {
  // Carregar usuários do localStorage
  const loadUsers = (): User[] => {
    try {
      const stored = localStorage.getItem('catalog-users');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
    
    // Usuários padrão se não houver dados salvos
    return [
      {
        id: '1',
        username: 'MoveisBonafe',
        password: 'Bonafe1108',
        priceLevel: 'vip',
        customMultiplier: 0.97, // -3%
        permissions: {
          canEditProducts: true,
          canViewPrices: true,
          canEditPrices: true,
        }
      },
      {
        id: '2',
        username: 'Vendedor1',
        password: 'vend123',
        priceLevel: 'basic',
        customMultiplier: 1.0, // preço normal
        permissions: {
          canEditProducts: false,
          canViewPrices: true,
          canEditPrices: false,
        }
      },
      {
        id: '3',
        username: 'Vendedor2',
        password: 'vend456',
        priceLevel: 'basic',
        customMultiplier: 1.05, // +5%
        permissions: {
          canEditProducts: false,
          canViewPrices: true,
          canEditPrices: false,
        }
      }
    ];
  };

  const [users, setUsers] = useState<User[]>(loadUsers);

  // Função para salvar usuários no localStorage
  const saveUsers = (updatedUsers: User[]) => {
    try {
      localStorage.setItem('catalog-users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Erro ao salvar usuários:', error);
    }
  };

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: '',
    password: '',
    priceLevel: 'basic',
    customMultiplier: 1.0,
    permissions: {
      canEditProducts: false,
      canViewPrices: true,
      canEditPrices: false,
    }
  });

  const handleCreateUser = () => {
    if (newUser.username && newUser.password) {
      const user: User = {
        id: Date.now().toString(),
        username: newUser.username,
        password: newUser.password,
        priceLevel: newUser.priceLevel || 'basic',
        customMultiplier: newUser.customMultiplier || 1.0,
        permissions: newUser.permissions || {
          canEditProducts: false,
          canViewPrices: true,
          canEditPrices: false,
        }
      };
      saveUsers([...users, user]);
      setNewUser({
        username: '',
        password: '',
        priceLevel: 'basic',
        customMultiplier: 1.0,
        permissions: {
          canEditProducts: false,
          canViewPrices: true,
          canEditPrices: false,
        }
      });
      setIsCreating(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleSaveEdit = () => {
    if (editingUser) {
      saveUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      saveUsers(users.filter(u => u.id !== userId));
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const formatMultiplier = (multiplier: number) => {
    const percentage = ((multiplier - 1) * 100);
    if (percentage > 0) return `+${percentage.toFixed(1)}%`;
    if (percentage < 0) return `${percentage.toFixed(1)}%`;
    return 'Normal';
  };

  const getPriceLevelColor = (level: string) => {
    switch (level) {
      case 'vip': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'premium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'basic': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciar Usuários</h2>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Como funciona o sistema de preços:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li><strong>Multiplicador:</strong> Define como o preço base será alterado (ex: 0.97 = -3%, 1.05 = +5%)</li>
          <li><strong>VIP:</strong> Acesso administrativo completo + multiplicador personalizado</li>
          <li><strong>Básico:</strong> Acesso a todas as tabelas de preço com multiplicador personalizado</li>
        </ul>
      </div>

      {/* Formulário de criação */}
      {isCreating && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Criar Novo Usuário</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="Digite o nome de usuário"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Digite a senha"
              />
            </div>
            <div>
              <Label htmlFor="priceLevel">Nível de Preço</Label>
              <select
                id="priceLevel"
                value={newUser.priceLevel}
                onChange={(e) => setNewUser({ ...newUser, priceLevel: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">Básico</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div>
              <Label htmlFor="multiplier">Multiplicador de Preço</Label>
              <Input
                id="multiplier"
                type="number"
                step="0.01"
                min="0.1"
                max="2.0"
                value={newUser.customMultiplier}
                onChange={(e) => setNewUser({ ...newUser, customMultiplier: parseFloat(e.target.value) || 1.0 })}
                placeholder="1.0"
              />
              <p className="text-xs text-slate-500 mt-1">
                Ex: 0.97 = -3%, 1.05 = +5%, 1.0 = preço normal
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <Label>Permissões</Label>
            <div className="flex flex-wrap gap-4 mt-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newUser.permissions?.canEditProducts}
                  onChange={(e) => setNewUser({
                    ...newUser,
                    permissions: { ...newUser.permissions!, canEditProducts: e.target.checked }
                  })}
                />
                <span className="text-sm">Editar Produtos</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newUser.permissions?.canViewPrices}
                  onChange={(e) => setNewUser({
                    ...newUser,
                    permissions: { ...newUser.permissions!, canViewPrices: e.target.checked }
                  })}
                />
                <span className="text-sm">Ver Preços</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newUser.permissions?.canEditPrices}
                  onChange={(e) => setNewUser({
                    ...newUser,
                    permissions: { ...newUser.permissions!, canEditPrices: e.target.checked }
                  })}
                />
                <span className="text-sm">Editar Preços</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <Button onClick={handleCreateUser} className="bg-green-600 hover:bg-green-700">
              <Save className="mr-2 h-4 w-4" />
              Criar Usuário
            </Button>
            <Button onClick={() => setIsCreating(false)} variant="outline">
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Lista de usuários */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Senha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nível
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Multiplicador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Permissões
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?.id === user.id ? (
                      <Input
                        value={editingUser.username}
                        onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                        className="w-32"
                      />
                    ) : (
                      <div className="font-medium text-slate-900">{user.username}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?.id === user.id ? (
                      <Input
                        type="password"
                        value={editingUser.password}
                        onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                        className="w-32"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">
                          {showPasswords[user.id] ? user.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(user.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {showPasswords[user.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?.id === user.id ? (
                      <select
                        value={editingUser.priceLevel}
                        onChange={(e) => setEditingUser({ ...editingUser, priceLevel: e.target.value as any })}
                        className="px-2 py-1 border border-slate-300 rounded text-sm"
                      >
                        <option value="basic">Básico</option>
                        <option value="vip">VIP</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriceLevelColor(user.priceLevel)}`}>
                        {user.priceLevel.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?.id === user.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        min="0.1"
                        max="2.0"
                        value={editingUser.customMultiplier}
                        onChange={(e) => setEditingUser({ ...editingUser, customMultiplier: parseFloat(e.target.value) || 1.0 })}
                        className="w-20"
                      />
                    ) : (
                      <span className={`font-medium ${user.customMultiplier < 1 ? 'text-green-600' : user.customMultiplier > 1 ? 'text-red-600' : 'text-slate-600'}`}>
                        {formatMultiplier(user.customMultiplier)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.canEditProducts && (
                        <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          Editar
                        </span>
                      )}
                      {user.permissions.canViewPrices && (
                        <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Ver Preços
                        </span>
                      )}
                      {user.permissions.canEditPrices && (
                        <span className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                          Editar Preços
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?.id === user.id ? (
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700">
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}