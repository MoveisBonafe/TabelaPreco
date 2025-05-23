import { useState } from 'react';
import { Product, InsertProduct, InsertCategory } from '@shared/schema';
import { Navbar } from '@/components/layout/navbar';
import { AdminTabs } from '@/components/admin/admin-tabs';
import { ProductsTab } from '@/components/admin/products-tab';
import { CategoriesTab } from '@/components/admin/categories-tab';
import { PricingTab } from '@/components/admin/pricing-tab';
import { UsersTab } from '@/components/admin/users-tab';
import { ExcelImportExport } from '@/components/admin/excel-import-export';
import { BackupSystem } from '@/components/admin/backup-system';
import { DatabaseMonitoring } from '@/components/admin/database-monitoring';
import { ProductModal } from '@/components/modals/product-modal';
import { ProductFormModal } from '@/components/modals/product-form-modal';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { useToast } from '@/components/ui/toast';
import { auth } from '@/lib/auth';

interface AdminProps {
  onLogout: () => void;
  onShowPublicView: () => void;
}

export function Admin({ onLogout, onShowPublicView }: AdminProps) {
  const { products, createProduct, updateProduct, deleteProduct } = useProducts();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { showToast, ToastContainer } = useToast();
  const [activeTab, setActiveTab] = useState('products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProductFormModalOpen, setIsProductFormModalOpen] = useState(false);
  
  const currentUser = auth.getUser();
  const canEditProducts = currentUser?.permissions?.canEditProducts ?? false;
  const canEditPrices = currentUser?.permissions?.canEditPrices ?? false;

  const handleCreateProduct = (productData: InsertProduct) => {
    try {
      createProduct(productData);
      showToast('Produto criado com sucesso!');
    } catch (error) {
      showToast('Erro ao criar produto', 'error');
    }
  };

  const handleUpdateProduct = (id: string, productData: Partial<InsertProduct>) => {
    try {
      updateProduct(id, productData);
      showToast('Produto atualizado com sucesso!');
    } catch (error) {
      showToast('Erro ao atualizar produto', 'error');
    }
  };

  const handleDeleteProduct = (id: string) => {
    try {
      deleteProduct(id);
      showToast('Produto excluído com sucesso!');
    } catch (error) {
      showToast('Erro ao excluir produto', 'error');
    }
  };

  const handleCreateCategory = (categoryData: InsertCategory) => {
    try {
      createCategory(categoryData);
      showToast('Categoria criada com sucesso!');
    } catch (error) {
      showToast('Erro ao criar categoria', 'error');
    }
  };

  const handleUpdateCategory = (id: string, categoryData: Partial<InsertCategory>) => {
    try {
      updateCategory(id, categoryData);
      showToast('Categoria atualizada com sucesso!');
    } catch (error) {
      showToast('Erro ao atualizar categoria', 'error');
    }
  };

  const handleDeleteCategory = (id: string) => {
    try {
      deleteCategory(id);
      showToast('Categoria excluída com sucesso!');
    } catch (error) {
      showToast('Erro ao excluir categoria', 'error');
    }
  };

  const handleImportProducts = (products: InsertProduct[]) => {
    try {
      products.forEach(product => createProduct(product));
      showToast(`${products.length} produtos importados com sucesso!`);
    } catch (error) {
      showToast('Erro ao importar produtos', 'error');
    }
  };

  const handleImportCategories = (categories: InsertCategory[]) => {
    try {
      categories.forEach(category => createCategory(category));
      showToast(`${categories.length} categorias importadas com sucesso!`);
    } catch (error) {
      showToast('Erro ao importar categorias', 'error');
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductFormModalOpen(true);
  };

  const handleEditFormSave = (productData: InsertProduct) => {
    if (selectedProduct) {
      handleUpdateProduct(selectedProduct.id, productData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        isAdmin={true}
        onLogout={onLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'products' && (
          <ProductsTab
            products={products}
            onCreateProduct={handleCreateProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onViewProduct={handleViewProduct}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesTab
            categories={categories}
            onCreateCategory={handleCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeTab === 'pricing' && (
          <PricingTab 
            products={products} 
            onEditProduct={handleEditProduct}
          />
        )}

        {activeTab === 'users' && (
          <UsersTab />
        )}

        {activeTab === 'excel' && (
          <ExcelImportExport
            products={products}
            categories={categories}
            onImportProducts={handleImportProducts}
            onImportCategories={handleImportCategories}
          />
        )}

        {activeTab === 'backup' && (
          <BackupSystem />
        )}

        {activeTab === 'database' && (
          <DatabaseMonitoring />
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        isVisible={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />

      {/* Product Edit Modal */}
      <ProductFormModal
        product={selectedProduct}
        isVisible={isProductFormModalOpen}
        onClose={() => {
          setIsProductFormModalOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleEditFormSave}
      />

      <ToastContainer />
    </div>
  );
}
