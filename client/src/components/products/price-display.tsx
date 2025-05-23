import { Product } from '@shared/schema';
import { AuthState } from '@/lib/auth';

interface PriceDisplayProps {
  product: Product;
  userAuth?: AuthState['user'];
}

export function PriceDisplay({ product, userAuth }: PriceDisplayProps) {
  // Se não há usuário autenticado, não mostra preços
  if (!userAuth || !userAuth.permissions.canViewPrices) {
    return (
      <div className="text-center py-4">
        <p className="text-slate-600">Faça login para ver os preços</p>
      </div>
    );
  }

  // Define os preços baseado no multiplicador do usuário
  const getPricesForLevel = () => {
    // Buscar o multiplicador do usuário salvo no sistema de usuários
    const storedUsers = localStorage.getItem('catalog-users');
    let multiplier = 1.0;
    
    if (storedUsers && userAuth) {
      try {
        const users = JSON.parse(storedUsers);
        const currentUser = users.find((u: any) => u.username === userAuth.username);
        if (currentUser) {
          multiplier = currentUser.customMultiplier || 1.0;
        }
      } catch (error) {
        console.error('Erro ao buscar multiplicador do usuário:', error);
      }
    }

    // Todos os usuários veem todas as tabelas, apenas com multiplicador diferente
    return {
      avista: product.priceAVista * multiplier,
      price30: product.price30 * multiplier,
      price30_60: product.price30_60 * multiplier,
      price30_60_90: product.price30_60_90 * multiplier,
      price30_60_90_120: product.price30_60_90_120 * multiplier,
      showOthers: true,
      maxInstallments: 4,
      multiplier: multiplier,
      isVip: userAuth.permissions.priceLevel === 'vip'
    };
  };

  const prices = getPricesForLevel();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Preços para {userAuth.username}</h3>
        {prices.multiplier !== 1.0 && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            prices.multiplier < 1 ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' : 
            'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
          }`}>
            {prices.multiplier < 1 ? 
              `Desconto ${((1 - prices.multiplier) * 100).toFixed(1)}%` : 
              `+${((prices.multiplier - 1) * 100).toFixed(1)}%`
            }
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Preço À Vista */}
        <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 rounded-lg p-4 text-center">
          <div className="font-bold text-sm mb-1">À Vista</div>
          <div className="font-bold text-lg">
            R$ {prices.avista.toFixed(2).replace('.', ',')}
          </div>
          {userAuth.permissions.priceLevel === 'basic' && (
            <div className="text-xs mt-1 opacity-75">Preço especial</div>
          )}
        </div>

        {/* Outros preços apenas se permitido */}
        {prices.showOthers && (
          <>
            <div className="bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-lg p-4 text-center">
              <div className="font-bold text-sm mb-1">30 dias</div>
              <div className="font-bold text-lg">
                R$ {prices.price30!.toFixed(2).replace('.', ',')}
              </div>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 text-purple-700 rounded-lg p-4 text-center">
              <div className="font-bold text-sm mb-1">30/60</div>
              <div className="font-bold text-lg">
                R$ {prices.price30_60!.toFixed(2).replace('.', ',')}
              </div>
              <div className="text-xs mt-1 opacity-75">
                2x de R$ {(prices.price30_60! / 2).toFixed(2).replace('.', ',')}
              </div>
            </div>

            {(prices.maxInstallments || 0) >= 3 && prices.price30_60_90 && (
              <div className="bg-orange-50 border-2 border-orange-200 text-orange-700 rounded-lg p-4 text-center">
                <div className="font-bold text-sm mb-1">30/60/90</div>
                <div className="font-bold text-lg">
                  R$ {prices.price30_60_90.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-xs mt-1 opacity-75">
                  3x de R$ {(prices.price30_60_90 / 3).toFixed(2).replace('.', ',')}
                </div>
              </div>
            )}

            {(prices.maxInstallments || 0) >= 4 && prices.price30_60_90_120 && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-lg p-4 text-center">
                <div className="font-bold text-sm mb-1">30/60/90/120</div>
                <div className="font-bold text-lg">
                  R$ {prices.price30_60_90_120.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-xs mt-1 opacity-75">
                  4x de R$ {(prices.price30_60_90_120 / 4).toFixed(2).replace('.', ',')}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Informação sobre o multiplicador */}
      <div className="text-xs text-slate-500 text-center">
        {prices.multiplier === 1.0 ? 
          'Preços normais aplicados' : 
          `Multiplicador ${prices.multiplier}x aplicado aos preços base`
        }
      </div>
    </div>
  );
}