import { Product } from '@shared/schema';
import { CreditCard, Calendar, Clock, Timer } from 'lucide-react';

interface PriceTablesProps {
  product: Product;
}

export function PriceTables({ product }: PriceTablesProps) {
  const priceOptions = [
    {
      id: 'avista',
      title: 'À Vista',
      subtitle: 'Pagamento à vista',
      price: product.priceAVista,
      icon: CreditCard,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      highlight: true
    },
    {
      id: '30',
      title: '30 dias',
      subtitle: 'Pagamento em 30 dias',
      price: product.price30,
      icon: Calendar,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    {
      id: '30_60',
      title: '30/60',
      subtitle: '2x sem juros',
      price: product.price30_60,
      icon: Clock,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    },
    {
      id: '30_60_90',
      title: '30/60/90',
      subtitle: '3x sem juros',
      price: product.price30_60_90,
      icon: Timer,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200'
    },
    {
      id: '30_60_90_120',
      title: '30/60/90/120',
      subtitle: '4x sem juros',
      price: product.price30_60_90_120,
      icon: Timer,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">Tabelas de Preços</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {priceOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.id}
              className={`${option.bgColor} ${option.borderColor} ${option.textColor} border-2 rounded-lg p-4 text-center transition-all duration-200 hover:shadow-md ${
                option.highlight ? 'ring-2 ring-emerald-300 shadow-lg' : ''
              }`}
            >
              <div className="flex justify-center mb-2">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-bold text-sm mb-1">{option.title}</div>
              <div className="text-xs opacity-75 mb-2">{option.subtitle}</div>
              <div className="font-bold text-lg">
                R$ {option.price.toFixed(2).replace('.', ',')}
              </div>
              {option.id !== 'avista' && (
                <div className="text-xs mt-1 opacity-75">
                  {option.id === '30_60_90_120' ? '4x de ' : 
                   option.id === '30_60_90' ? '3x de ' :
                   option.id === '30_60' ? '2x de ' : ''}
                  {option.id !== '30' && (
                    <>R$ {(option.price / (option.id === '30_60_90_120' ? 4 : option.id === '30_60_90' ? 3 : 2)).toFixed(2).replace('.', ',')}</>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tabela Detalhada para Desktop */}
      <div className="hidden lg:block bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
          <h4 className="font-semibold text-slate-800">Condições de Pagamento</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Condição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Parcelas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Economia vs Parcelado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-emerald-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-emerald-600 mr-2" />
                    <span className="font-medium text-slate-900">À Vista</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-emerald-600 font-bold">
                  R$ {product.priceAVista.toFixed(2).replace('.', ',')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                  Pagamento único
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                    Melhor preço
                  </span>
                </td>
              </tr>
              
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="font-medium text-slate-900">30 dias</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-bold">
                  R$ {product.price30.toFixed(2).replace('.', ',')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                  1x em 30 dias
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-red-600">
                  +R$ {(product.price30 - product.priceAVista).toFixed(2).replace('.', ',')}
                </td>
              </tr>

              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="font-medium text-slate-900">30/60</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-purple-600 font-bold">
                  R$ {product.price30_60.toFixed(2).replace('.', ',')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                  2x de R$ {(product.price30_60 / 2).toFixed(2).replace('.', ',')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-red-600">
                  +R$ {(product.price30_60 - product.priceAVista).toFixed(2).replace('.', ',')}
                </td>
              </tr>

              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Timer className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="font-medium text-slate-900">30/60/90</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-orange-600 font-bold">
                  R$ {product.price30_60_90.toFixed(2).replace('.', ',')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                  3x de R$ {(product.price30_60_90 / 3).toFixed(2).replace('.', ',')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-red-600">
                  +R$ {(product.price30_60_90 - product.priceAVista).toFixed(2).replace('.', ',')}
                </td>
              </tr>

              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Timer className="h-4 w-4 text-red-600 mr-2" />
                    <span className="font-medium text-slate-900">30/60/90/120</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-red-600 font-bold">
                  R$ {product.price30_60_90_120.toFixed(2).replace('.', ',')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                  4x de R$ {(product.price30_60_90_120 / 4).toFixed(2).replace('.', ',')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-red-600">
                  +R$ {(product.price30_60_90_120 - product.priceAVista).toFixed(2).replace('.', ',')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}