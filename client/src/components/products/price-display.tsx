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

  // Define quais preços mostrar baseado no nível de acesso
  const getPricesForLevel = () => {
    switch (userAuth.permissions.priceLevel) {
      case 'basic':
        // Nível básico: apenas preço à vista com 5% adicional
        return {
          avista: product.priceAVista * 1.05,
          showOthers: false
        };
      
      case 'premium':
        // Nível premium: preços normais sem desconto VIP
        return {
          avista: product.priceAVista,
          price30: product.price30,
          price30_60: product.price30_60,
          showOthers: true,
          maxInstallments: 2
        };
      
      case 'vip':
        // Nível VIP: todos os preços com desconto adicional de 3%
        return {
          avista: product.priceAVista * 0.97,
          price30: product.price30 * 0.97,
          price30_60: product.price30_60 * 0.97,
          price30_60_90: product.price30_60_90 * 0.97,
          price30_60_90_120: product.price30_60_90_120 * 0.97,
          showOthers: true,
          maxInstallments: 4,
          vipDiscount: true
        };
      
      default:
        return {
          avista: product.priceAVista,
          showOthers: false
        };
    }
  };

  const prices = getPricesForLevel();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Preços para {userAuth.username}</h3>
        {prices.vipDiscount && (
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            VIP -3%
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

      {/* Informação sobre nível de acesso */}
      <div className="text-xs text-slate-500 text-center">
        {userAuth.permissions.priceLevel === 'basic' && 'Nível Básico - Preços especiais aplicados'}
        {userAuth.permissions.priceLevel === 'premium' && 'Nível Premium - Acesso a condições de pagamento'}
        {userAuth.permissions.priceLevel === 'vip' && 'Nível VIP - Melhores preços e todas as condições'}
      </div>
    </div>
  );
}