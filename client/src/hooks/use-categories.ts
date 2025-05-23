import { useState, useEffect } from 'react';
import { Category, InsertCategory } from '@shared/schema';
import { storage } from '@/lib/storage';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = () => {
    try {
      const data = storage.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const createCategory = (categoryData: InsertCategory) => {
    try {
      const newCategory = storage.saveCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  };

  const updateCategory = (id: string, categoryData: Partial<InsertCategory>) => {
    try {
      const updatedCategory = storage.updateCategory(id, categoryData);
      if (updatedCategory) {
        setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
        return updatedCategory;
      }
      throw new Error('Category not found');
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  };

  const deleteCategory = (id: string) => {
    try {
      const success = storage.deleteCategory(id);
      if (success) {
        setCategories(prev => prev.filter(c => c.id !== id));
      }
      return success;
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
