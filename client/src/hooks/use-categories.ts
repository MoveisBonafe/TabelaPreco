import { useState, useEffect } from 'react';
import { Category, InsertCategory } from '@shared/schema';
import { storageAdapter } from '@/lib/storage-adapter';
import { githubPagesSync } from '@/lib/github-pages-sync';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      const data = await storageAdapter.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    
    // Escuta atualizações de outros navegadores
    const unsubscribe = githubPagesSync.onDataUpdated(() => {
      loadCategories();
    });
    
    return unsubscribe;
  }, []);

  const createCategory = async (categoryData: InsertCategory) => {
    try {
      const newCategory = await storageAdapter.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<InsertCategory>) => {
    try {
      // Para categorias, por enquanto apenas atualiza local
      setCategories(prev => prev.map(c => 
        c.id === id ? { ...c, ...categoryData } : c
      ));
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  };

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    refresh: loadCategories,
  };
}
