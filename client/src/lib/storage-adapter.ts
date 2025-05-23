import { Product, Category, InsertProduct, InsertCategory } from '@shared/schema';
import { githubPagesSync } from './github-pages-sync';

// Detecta se está no ambiente de desenvolvimento (com backend) ou produção (GitHub Pages)
const isDevelopment = import.meta.env.DEV;

// Chaves para localStorage no GitHub Pages
const PRODUCTS_KEY = 'catalog-products-v2';
const CATEGORIES_KEY = 'catalog-categories-v2';

class StorageAdapter {
  private isUsingBackend: boolean;

  constructor() {
    this.isUsingBackend = isDevelopment;
  }

  private markDataChanged() {
    if (!this.isUsingBackend) {
      // Notifica outros navegadores/abas sobre mudanças
      githubPagesSync.notifyDataUpdated();
    }
  }

  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    if (this.isUsingBackend) {
      const response = await fetch('/api/products');
      return response.json();
    } else {
      // GitHub Pages: usa localStorage
      const stored = localStorage.getItem(PRODUCTS_KEY);
      return stored ? JSON.parse(stored) : [];
    }
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    if (this.isUsingBackend) {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      return response.json();
    } else {
      // GitHub Pages: salva no localStorage
      const products = await this.getProducts();
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        finalPrice: productData.priceAVista * (1 - (productData.discount || 0) / 100),
        price30: productData.priceAVista * 1.02,
        price30_60: productData.priceAVista * 1.04,
        price30_60_90: productData.priceAVista * 1.06,
        price30_60_90_120: productData.priceAVista * 1.08,
        createdAt: new Date(),
      };
      
      products.push(newProduct);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      this.markDataChanged();
      return newProduct;
    }
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    if (this.isUsingBackend) {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      return response.json();
    } else {
      const products = await this.getProducts();
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        const updated = { ...products[index], ...productData };
        if (productData.priceAVista) {
          updated.finalPrice = productData.priceAVista * (1 - (updated.discount || 0) / 100);
        }
        products[index] = updated;
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        this.markDataChanged();
        return updated;
      }
      return undefined;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    if (this.isUsingBackend) {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      return response.ok;
    } else {
      const products = await this.getProducts();
      const filtered = products.filter(p => p.id !== id);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
      this.markDataChanged();
      return true;
    }
  }

  // CATEGORIES  
  async getCategories(): Promise<Category[]> {
    if (this.isUsingBackend) {
      const response = await fetch('/api/categories');
      return response.json();
    } else {
      const stored = localStorage.getItem(CATEGORIES_KEY);
      return stored ? JSON.parse(stored) : [
        { id: '1', name: 'Geral', description: 'Categoria geral', icon: '', color: '', active: true, productCount: 0 }
      ];
    }
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    if (this.isUsingBackend) {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });
      return response.json();
    } else {
      const categories = await this.getCategories();
      const newCategory: Category = {
        ...categoryData,
        id: Date.now().toString(),
        productCount: 0,
      };
      
      categories.push(newCategory);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
      this.markDataChanged();
      return newCategory;
    }
  }

  // BULK IMPORT (compatível com ambos os ambientes)
  async bulkImportProducts(products: InsertProduct[]): Promise<{ message: string; products: Product[] }> {
    if (this.isUsingBackend) {
      const response = await fetch('/api/products/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      });
      return response.json();
    } else {
      const results: Product[] = [];
      for (const productData of products) {
        // Verifica se já existe pelo nome
        const existing = (await this.getProducts()).find(p => p.name === productData.name);
        if (existing) {
          // Atualiza existente
          const updated = await this.updateProduct(existing.id, productData);
          if (updated) results.push(updated);
        } else {
          // Cria novo
          const created = await this.createProduct(productData);
          results.push(created);
        }
      }
      
      return {
        message: `${results.length} produtos processados com sucesso!`,
        products: results
      };
    }
  }

}

export const storageAdapter = new StorageAdapter();