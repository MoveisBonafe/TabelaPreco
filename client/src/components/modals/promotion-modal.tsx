
import { useState, useEffect } from 'react';
import { X, Save, Palette } from 'lucide-react';
import { Promotion, InsertPromotion } from '@/hooks/use-promotions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PromotionModalProps {
  promotion?: Promotion | null;
  isVisible: boolean;
  onClose: () => void;
  onSave: (promotionData: InsertPromotion) => void;
}

const PRESET_COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#6b7280', // gray-500
  '#1f2937', // gray-800
];

export function PromotionModal({ promotion, isVisible, onClose, onSave }: PromotionModalProps) {
  const [formData, setFormData] = useState<InsertPromotion>({
    texto: '',
    descricao: '',
    cor: '#ef4444',
    ativo: false,
  });

  useEffect(() => {
    if (promotion) {
      setFormData({
        texto: promotion.texto,
        descricao: promotion.descricao,
        cor: promotion.cor,
        ativo: promotion.ativo,
      });
    } else {
      setFormData({
        texto: '',
        descricao: '',
        cor: '#ef4444',
        ativo: false,
      });
    }
  }, [promotion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-xl font-bold text-slate-800">
            🎯 {promotion ? 'Editar Promoção' : 'Nova Promoção'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Texto da Promoção *
            </Label>
            <Input
              type="text"
              value={formData.texto}
              onChange={(e) => setFormData(prev => ({ ...prev, texto: e.target.value }))}
              required
              placeholder="Ex: Desconto Especial de 20%!"
              className="w-full"
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Descrição (opcional)
            </Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Ex: Válido até o final do mês para todos os produtos"
              rows={3}
              className="w-full"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-3">
              <Palette className="inline h-4 w-4 mr-1" />
              Cor de Fundo
            </Label>
            
            {/* Cores predefinidas */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, cor: color }))}
                  className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 ${
                    formData.cor === color 
                      ? 'border-slate-400 scale-110 shadow-md' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            {/* Seletor de cor customizada */}
            <div className="flex items-center space-x-3">
              <Input
                type="color"
                value={formData.cor}
                onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                className="w-16 h-10 rounded-lg border border-slate-200"
              />
              <Input
                type="text"
                value={formData.cor}
                onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                placeholder="#000000"
                className="flex-1 font-mono text-sm"
              />
            </div>
          </div>

          {/* Preview */}
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Preview
            </Label>
            <div 
              className="w-full p-4 rounded-lg text-white text-center font-medium shadow-sm"
              style={{ backgroundColor: formData.cor }}
            >
              {formData.texto || 'Texto da promoção aparecerá aqui'}
            </div>
          </div>

          <div className="flex items-center space-x-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <input
              type="checkbox"
              id="promotion-ativo"
              checked={formData.ativo}
              onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <Label htmlFor="promotion-ativo" className="text-sm font-medium text-amber-800">
              ⭐ Ativar esta promoção
            </Label>
          </div>

          {formData.ativo && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Importante:</strong> Apenas uma promoção pode estar ativa por vez. 
                Ativar esta promoção desativará automaticamente todas as outras.
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-slate-200">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 font-semibold">
              <Save className="mr-2 h-4 w-4" />
              {promotion ? 'Atualizar' : 'Criar'} Promoção
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1 font-semibold"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
