import { Category } from '@shared/schema';

interface CategoryFilterProps {
  categories: Category[];
  onCategoryClick: (categoryName: string) => void;
}

export function CategoryFilter({ categories, onCategoryClick }: CategoryFilterProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Categorias</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => onCategoryClick(category.name)}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            style={{ borderLeft: `4px solid ${category.color}` }}
          >
            <div className="flex flex-col items-center text-center">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <span className="text-3xl">{category.icon}</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">{category.name}</h3>
              <p className="text-slate-600 text-sm">
                {category.productCount} produto{category.productCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}