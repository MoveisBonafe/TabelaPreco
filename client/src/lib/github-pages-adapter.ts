import { supabase, hasSupabaseCredentials } from './supabase';

// Detectar se está rodando no GitHub Pages
export const isGitHubPages = () => {
  return window.location.hostname.includes('github.io') || 
         import.meta.env.VITE_GITHUB_PAGES === 'true';
};

// Adapter para funcionar tanto no Replit quanto no GitHub Pages
export class GitHubPagesAdapter {
  static async fetchProducts() {
    if (isGitHubPages() && hasSupabaseCredentials && supabase) {
      // Usar Supabase diretamente no GitHub Pages
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } else {
      // Usar API local no Replit
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  }

  static async createProduct(product: any) {
    if (isGitHubPages() && hasSupabaseCredentials && supabase) {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!response.ok) throw new Error('Failed to create product');
      return response.json();
    }
  }

  static async updateProduct(id: string, updates: any) {
    if (isGitHubPages() && hasSupabaseCredentials && supabase) {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    }
  }

  static async deleteProduct(id: string) {
    if (isGitHubPages() && hasSupabaseCredentials && supabase) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } else {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    }
  }

  static async fetchCategories() {
    if (isGitHubPages() && hasSupabaseCredentials && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    } else {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  }

  static async createCategory(category: any) {
    if (isGitHubPages() && hasSupabaseCredentials && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      });
      if (!response.ok) throw new Error('Failed to create category');
      return response.json();
    }
  }

  static setupRealTimeSync(callback: (payload: any) => void) {
    if (isGitHubPages() && hasSupabaseCredentials && supabase) {
      // Usar Supabase Realtime no GitHub Pages
      const channel = supabase
        .channel('github-pages-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'products' }, 
          callback
        )
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'categories' }, 
          callback
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    } else {
      // Usar WebSocket local no Replit
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      return () => socket.close();
    }
  }
}