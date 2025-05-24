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
    priceAVista: 0,
    image: '',
    images: [],
    specifications: [],
    active: true,
    fixedPrice: false,
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
        priceAVista: product.priceAVista,
        image: product.image,
        images: product.images || [],
        specifications: product.specifications || [],
        active: product.active,
        fixedPrice: product.fixedPrice || false,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        basePrice: 0,
        discount: 0,
        priceAVista: 0,
        image: '',
        images: [],
        specifications: [],
        active: true,
        fixedPrice: false,
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
      // Verificar tamanho do arquivo (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert('O arquivo é muito grande. Tamanho máximo: 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setFormData(prev => ({ 
            ...prev, 
            image: prev.image || result, // Define como imagem principal se ainda não tem
            images: [...prev.images, result] // Adiciona ao array de imagens
          }));
        }
      };
      reader.onerror = () => {
        alert('Erro ao ler o arquivo. Tente novamente.');
      };
      reader.readAsDataURL(file);
    }
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const addImageUrl = (url: string) => {
    if (url.trim()) {
      setFormData(prev => ({
        ...prev,
        image: prev.image || url, // Define como imagem principal se ainda não tem
        images: [...prev.images, url] // Adiciona ao array de imagens
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image: index === 0 && newImages.length > 0 ? newImages[0] : prev.image // Se removeu a primeira, a próxima vira principal
      };
    });
  };

  const setMainImage = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Preço À Vista (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.priceAVista}
                onChange={(e) => setFormData(prev => ({ ...prev, priceAVista: parseFloat(e.target.value) || 0 }))}
                required
                placeholder="0,00"
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

          <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              id="fixedPrice"
              checked={formData.fixedPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, fixedPrice: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="fixedPrice" className="text-sm font-medium text-blue-800">
              🔒 Preço Fixo - Este produto não será afetado pelo multiplicador de preços dos usuários
            </Label>
          </div>

          {/* Preview das Tabelas de Preço */}
          {formData.priceAVista > 0 && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-800 mb-3">Preview das Tabelas de Preços</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                <div className="bg-emerald-100 text-emerald-800 p-2 rounded text-center">
                  <div className="font-medium">À Vista</div>
                  <div>R$ {formData.priceAVista.toFixed(2).replace('.', ',')}</div>
                </div>
                <div className="bg-blue-100 text-blue-800 p-2 rounded text-center">
                  <div className="font-medium">30 dias</div>
                  <div>R$ {(formData.priceAVista * 1.02).toFixed(2).replace('.', ',')}</div>
                </div>
                <div className="bg-purple-100 text-purple-800 p-2 rounded text-center">
                  <div className="font-medium">30/60</div>
                  <div>R$ {(formData.priceAVista * 1.04).toFixed(2).replace('.', ',')}</div>
                </div>
                <div className="bg-orange-100 text-orange-800 p-2 rounded text-center">
                  <div className="font-medium">30/60/90</div>
                  <div>R$ {(formData.priceAVista * 1.06).toFixed(2).replace('.', ',')}</div>
                </div>
                <div className="bg-red-100 text-red-800 p-2 rounded text-center">
                  <div className="font-medium">30/60/90/120</div>
                  <div>R$ {(formData.priceAVista * 1.08).toFixed(2).replace('.', ',')}</div>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Imagens do Produto</Label>
            
            {/* Adicionar nova imagem */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    type="url"
                    placeholder="Cole uma URL de imagem aqui..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        addImageUrl(input.value);
                        input.value = '';
                      }
                    }}
                  />
                  <div className="text-center text-sm text-slate-500">ou</div>
                  <div 
                    className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center hover:border-blue-400 transition-colors duration-200 cursor-pointer"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                    <p className="text-slate-600 text-xs">Clique para fazer upload</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                  </div>
                </div>
                
                <div className="text-xs text-slate-500 space-y-1">
                  <p>• A primeira imagem será a principal</p>
                  <p>• Máximo 5MB por imagem</p>
                  <p>• Formatos: JPG, PNG, GIF</p>
                  <p>• Pressione Enter para adicionar URL</p>
                </div>
              </div>
            </div>

            {/* Gallery de imagens */}
            {formData.images.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Galeria ({formData.images.length} imagens)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className={`w-full h-24 border-2 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center ${
                        formData.image === imageUrl ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'
                      }`}>
                        <img
                          src={imageUrl}
                          alt={`Imagem ${index + 1}`}
                          className="max-w-full max-h-full object-contain"
                          onError={() => removeImage(index)}
                        />
                      </div>
                      
                      {/* Indicador de imagem principal */}
                      {formData.image === imageUrl && (
                        <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Principal
                        </div>
                      )}
                      
                      {/* Botões de ação */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center space-x-2">
                        {formData.image !== imageUrl && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="bg-white text-blue-600 h-6 px-2 text-xs"
                            onClick={() => setMainImage(imageUrl)}
                          >
                            Principal
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="bg-white text-red-600 h-6 px-2 text-xs"
                          onClick={() => removeImage(index)}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
