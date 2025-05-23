import { useState, useEffect } from 'react';
import { Product, InsertProduct } from '@shared/schema';
import { storageAdapter } from '@/lib/storage-adapter';
import { githubPagesSync } from '@/lib/github-pages-sync';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const data = await storageAdapter.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    
    // Escuta atualizações de outros navegadores (GitHub Pages)
    const unsubscribe = githubPagesSync.onDataUpdated(() => {
      loadProducts();
    });
    
    return unsubscribe;
  }, []);

  const createProduct = async (productData: InsertProduct) => {
    try {
      const newProduct = await storageAdapter.createProduct(productData);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<InsertProduct>) => {
    try {
      const updatedProduct = await storageAdapter.updateProduct(id, productData);
      if (updatedProduct) {
        setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      }
      return updatedProduct;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await storageAdapter.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  };

  const searchProducts = (query: string, category?: string) => {
    return products.filter(product => {
      const matchesQuery = !query || 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = !category || category === 'all' || product.category === category;
      
      return matchesQuery && matchesCategory && product.active;
    });
  };

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    refresh: loadProducts,
  };
}
