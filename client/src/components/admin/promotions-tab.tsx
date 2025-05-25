
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Promotion } from '@/hooks/use-promotions';
import { Button } from '@/components/ui/button';

interface PromotionsTabProps {
  promotions: Promotion[];
  onCreatePromotion: () => void;
  onEditPromotion: (promotion: Promotion) => void;
  onDeletePromotion: (id: string) => void;
}

export function PromotionsTab({ 
  promotions, 
  onCreatePromotion, 
  onEditPromotion, 
  onDeletePromotion 
}: PromotionsTabProps) {
  const handleDelete = (id: string, texto: string) => {
    if (confirm(`Tem certeza que deseja excluir a promoção "${texto}"?`)) {
      onDeletePromotion(id);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">🎯 Gerenciar Promoções</h2>
          <p className="text-slate-600">Crie e gerencie banners promocionais</p>
        </div>
        <Button onClick={onCreatePromotion} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Nova Promoção
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Texto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-slate-400 text-4xl mb-4">🎯</div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      Nenhuma promoção cadastrada
                    </h3>
                    <p className="text-slate-500 mb-4">
                      Crie sua primeira promoção para exibir banners no catálogo
                    </p>
                    <Button onClick={onCreatePromotion} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeira Promoção
                    </Button>
                  </td>
                </tr>
              ) : (
                promotions.map((promotion) => (
                  <tr 
                    key={promotion.id} 
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="w-24 h-12 rounded-lg flex items-center justify-center text-white text-xs font-medium shadow-sm"
                        style={{ backgroundColor: promotion.cor }}
                      >
                        Preview
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {promotion.texto}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-xs truncate">
                        {promotion.descricao || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        promotion.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {promotion.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditPromotion(promotion)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(promotion.id, promotion.texto)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {promotions.length > 0 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>
                Total: {promotions.length} promoção{promotions.length !== 1 ? 'ões' : ''}
              </span>
              <span>
                Ativa: {promotions.filter(p => p.ativo).length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
