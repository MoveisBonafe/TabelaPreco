import { useState, useEffect } from 'react';
import { X, Save, Upload } from 'lucide-react';
import { Product, InsertProduct } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/use-categories';

interface ProductFormModalProps {
  product?: Product | null;
  isVisible: boolean;
  onClose: () => void;
  onSave: (productData: InsertProduct) => void;
}

export function ProductFormModal({ product, isVisible, onClose, onSave }: ProductFormModalProps) {
  const { categories } = useCategories();
  const [formData, setFormData] = useState<InsertProduct>({
    name: '',
    description: '',
    category: '',
    basePrice: 0,
    discount: 0,
    image: '',
    specifications: [],
    active: true,
  });

  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        basePrice: product.basePrice,
        discount: product.discount,
        image: product.image,
        specifications: product.specifications || [],
        active: product.active,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        basePrice: 0,
        discount: 0,
        image: '',
        specifications: [],
        active: true,
      });
    }
  }, [product]);

  useEffect(() => {
    const calculatedPrice = formData.basePrice * (1 - (formData.discount || 0) / 100);
    setFinalPrice(calculatedPrice);
  }, [formData.basePrice, formData.discount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, image: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-xl font-bold text-slate-800">
            {product ? 'Editar Produto' : 'Adicionar Produto'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Nome do Produto</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Digite o nome do produto"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Digite a descrição do produto"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Preço Base (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                required
                placeholder="0,00"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Desconto (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Preço Final (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={finalPrice.toFixed(2)}
                readOnly
                className="bg-slate-50 text-slate-600"
              />
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">URL da Imagem</Label>
            <div className="space-y-2">
              <Input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <div className="text-center text-sm text-slate-500">ou</div>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600">Clique para fazer upload de uma imagem</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" className="mt-2">
                    Selecionar Arquivo
                  </Button>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-slate-200">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 font-semibold">
              <Save className="mr-2 h-4 w-4" />
              Salvar Produto
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
