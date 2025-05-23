import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Category, InsertCategory } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CategoryModalProps {
  category?: Category | null;
  isVisible: boolean;
  onClose: () => void;
  onSave: (categoryData: InsertCategory) => void;
}

const iconOptions = [
  { value: 'fas fa-mobile-alt', label: 'Eletrônicos' },
  { value: 'fas fa-tshirt', label: 'Roupas' },
  { value: 'fas fa-home', label: 'Casa' },
  { value: 'fas fa-car', label: 'Automotivo' },
  { value: 'fas fa-gamepad', label: 'Games' },
  { value: 'fas fa-book', label: 'Livros' },
  { value: 'fas fa-dumbbell', label: 'Esportes' },
  { value: 'fas fa-utensils', label: 'Alimentação' },
];

const colorOptions = [
  { value: 'blue', label: 'Azul' },
  { value: 'purple', label: 'Roxo' },
  { value: 'green', label: 'Verde' },
  { value: 'red', label: 'Vermelho' },
  { value: 'yellow', label: 'Amarelo' },
  { value: 'pink', label: 'Rosa' },
  { value: 'indigo', label: 'Índigo' },
  { value: 'gray', label: 'Cinza' },
];

export function CategoryModal({ category, isVisible, onClose, onSave }: CategoryModalProps) {
  const [formData, setFormData] = useState<InsertCategory>({
    name: '',
    description: '',
    icon: 'fas fa-tag',
    color: 'blue',
    active: true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        active: category.active,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'fas fa-tag',
        color: 'blue',
        active: true,
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 animate-slide-up">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-xl font-bold text-slate-800">
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Nome da Categoria</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Digite o nome da categoria"
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Digite a descrição da categoria"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Ícone</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-2">Cor</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-6 border-t border-slate-200">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 font-semibold">
              <Save className="mr-2 h-4 w-4" />
              Salvar Categoria
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
