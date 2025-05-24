import { useState, useEffect } from 'react';
import { firebaseProducts } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export function useFirebaseProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔥 Conectando ao Firebase para sincronização de produtos...');
    
    // Ouvir mudanças em tempo real
    const unsubscribe = firebaseProducts.onSnapshot((updatedProducts) => {
      console.log('📡 Produtos atualizados em tempo real:', updatedProducts.length);
      setProducts(updatedProducts);
      setLoading(false);
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  const createProduct = async (productData: any) => {
    try {
      await firebaseProducts.create(productData);
      toast({ title: 'Produto criado e sincronizado!', variant: 'default' });
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast({ title: 'Erro ao criar produto', variant: 'destructive' });
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: any) => {
    try {
      await firebaseProducts.update(id, updates);
      toast({ title: 'Produto atualizado e sincronizado!', variant: 'default' });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({ title: 'Erro ao atualizar produto', variant: 'destructive' });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await firebaseProducts.delete(id);
      toast({ title: 'Produto excluído e sincronizado!', variant: 'default' });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({ title: 'Erro ao excluir produto', variant: 'destructive' });
      throw error;
    }
  };

  const bulkImportProducts = async (productsData: any[]) => {
    try {
      const results = [];
      for (const productData of productsData) {
        const result = await firebaseProducts.create(productData);
        results.push(result);
      }
      toast({ title: `${results.length} produtos importados e sincronizados!`, variant: 'default' });
      return results;
    } catch (error) {
      console.error('Erro na importação em lote:', error);
      toast({ title: 'Erro na importação em lote', variant: 'destructive' });
      throw error;
    }
  };

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkImportProducts
  };
}