import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Category, InsertCategory } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { CategoryModal } from '@/components/modals/category-modal';

interface CategoriesTabProps {
  categories: Category[];
  onCreateCategory: (categoryData: InsertCategory) => void;
  onUpdateCategory: (id: string, categoryData: Partial<InsertCategory>) => void;
  onDeleteCategory: (id: string) => void;
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  pink: 'bg-pink-100 text-pink-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  gray: 'bg-gray-100 text-gray-600',
};

export function CategoriesTab({ 
  categories, 
  onCreateCategory, 
  onUpdateCategory, 
  onDeleteCategory 
}: CategoriesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      onDeleteCategory(category.id);
    }
  };

  const handleSave = (categoryData: InsertCategory) => {
    if (editingCategory) {
      onUpdateCategory(editingCategory.id, categoryData);
    } else {
      onCreateCategory(categoryData);
    }
    setEditingCategory(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-slate-800">Gerenciar Categorias</h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                colorClasses[category.color as keyof typeof colorClasses] || colorClasses.blue
              }`}>
                <i className={`${category.icon} text-xl`} />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(category)}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(category)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">{category.name}</h3>
            <p className="text-slate-600 text-sm mb-4">{category.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{category.productCount} produtos</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                category.active 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {category.active ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      <CategoryModal
        category={editingCategory}
        isVisible={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
}
