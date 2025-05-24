import { Product, Category, InsertProduct, InsertCategory } from "@shared/schema";

const STORAGE_KEYS = {
  PRODUCTS: 'catalog-products',
  CATEGORIES: 'catalog-categories',
  AUTH: 'catalog-auth'
};

export class LocalStorage {
  private getFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  // Products
  getProducts(): Product[] {
    const products = this.getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    return products.map(p => ({ ...p, createdAt: new Date(p.createdAt) }));
  }

  saveProduct(productData: InsertProduct): Product {
    const products = this.getProducts();
    const id = Date.now().toString();
    const finalPrice = productData.basePrice * (1 - (productData.discount || 0) / 100);
    
    // Calcular automaticamente as tabelas de preço baseadas no preço à vista
    const priceAVista = productData.priceAVista;
    // Se preço fixo, todas as tabelas têm o mesmo valor
    const price30 = productData.fixedPrice ? priceAVista : priceAVista * 1.02;
    const price30_60 = productData.fixedPrice ? priceAVista : priceAVista * 1.04;
    const price30_60_90 = productData.fixedPrice ? priceAVista : priceAVista * 1.06;
    const price30_60_90_120 = productData.fixedPrice ? priceAVista : priceAVista * 1.08;
    
    const product: Product = {
      ...productData,
      id,
      finalPrice,
      price30,
      price30_60,
      price30_60_90,
      price30_60_90_120,
      createdAt: new Date(),
    };

    products.push(product);
    this.saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    return product;
  }

  updateProduct(id: string, productData: Partial<InsertProduct>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) return null;

    const updatedProduct = { ...products[index], ...productData };
    
    // Recalcular preço final se necessário
    if (productData.basePrice !== undefined || productData.discount !== undefined) {
      updatedProduct.finalPrice = updatedProduct.basePrice * (1 - (updatedProduct.discount || 0) / 100);
    }
    
    // Recalcular tabelas de preço se o preço à vista foi alterado ou fixedPrice mudou
    if (productData.priceAVista !== undefined || productData.fixedPrice !== undefined) {
      const priceAVista = updatedProduct.priceAVista;
      const isFixedPrice = updatedProduct.fixedPrice;
      
      // Se preço fixo, todas as tabelas têm o mesmo valor
      updatedProduct.price30 = isFixedPrice ? priceAVista : priceAVista * 1.02;
      updatedProduct.price30_60 = isFixedPrice ? priceAVista : priceAVista * 1.04;
      updatedProduct.price30_60_90 = isFixedPrice ? priceAVista : priceAVista * 1.06;
      updatedProduct.price30_60_90_120 = isFixedPrice ? priceAVista : priceAVista * 1.08;
    }

    products[index] = updatedProduct;
    this.saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    return updatedProduct;
  }

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === products.length) return false;
    
    this.saveToStorage(STORAGE_KEYS.PRODUCTS, filteredProducts);
    return true;
  }

  // Categories
  getCategories(): Category[] {
    return this.getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, this.getDefaultCategories());
  }

  saveCategory(categoryData: InsertCategory): Category {
    const categories = this.getCategories();
    const id = Date.now().toString();
    
    const category: Category = {
      ...categoryData,
      id,
      productCount: 0,
    };

    categories.push(category);
    this.saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    return category;
  }

  updateCategory(id: string, categoryData: Partial<InsertCategory>): Category | null {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) return null;

    categories[index] = { ...categories[index], ...categoryData };
    this.saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    return categories[index];
  }

  deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const filteredCategories = categories.filter(c => c.id !== id);
    
    if (filteredCategories.length === categories.length) return false;
    
    this.saveToStorage(STORAGE_KEYS.CATEGORIES, filteredCategories);
    return true;
  }

  private getDefaultCategories(): Category[] {
    return [
      {
        id: '1',
        name: 'Eletrônicos',
        description: 'Smartphones, laptops, tablets e acessórios tecnológicos',
        icon: 'fas fa-mobile-alt',
        color: 'blue',
        active: true,
        productCount: 0,
      },
      {
        id: '2',
        name: 'Roupas',
        description: 'Camisetas, calças, vestidos e acessórios de moda',
        icon: 'fas fa-tshirt',
        color: 'purple',
        active: true,
        productCount: 0,
      },
      {
        id: '3',
        name: 'Casa e Jardim',
        description: 'Móveis, decoração e itens para jardim',
        icon: 'fas fa-home',
        color: 'green',
        active: true,
        productCount: 0,
      },
    ];
  }

  updateCategoryProductCounts(): void {
    const products = this.getProducts();
    const categories = this.getCategories();
    
    const updatedCategories = categories.map(category => ({
      ...category,
      productCount: products.filter(p => p.category === category.name && p.active).length,
    }));

    this.saveToStorage(STORAGE_KEYS.CATEGORIES, updatedCategories);
  }
}

export const storage = new LocalStorage();
