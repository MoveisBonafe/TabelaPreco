import { useState, useEffect } from 'react';
import { Product, InsertProduct } from '@shared/schema';
import { storage } from '@/lib/storage';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = () => {
    try {
      const data = storage.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const createProduct = (productData: InsertProduct) => {
    try {
      const newProduct = storage.saveProduct(productData);
      setProducts(prev => [...prev, newProduct]);
      storage.updateCategoryProductCounts();
      return newProduct;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  };

  const updateProduct = (id: string, productData: Partial<InsertProduct>) => {
    try {
      const updatedProduct = storage.updateProduct(id, productData);
      if (updatedProduct) {
        setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
        storage.updateCategoryProductCounts();
        return updatedProduct;
      }
      throw new Error('Product not found');
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  };

  const deleteProduct = (id: string) => {
    try {
      const success = storage.deleteProduct(id);
      if (success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        storage.updateCategoryProductCounts();
      }
      return success;
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
