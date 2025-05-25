
import { useState, useEffect } from 'react';

export interface Promotion {
  id: string;
  texto: string;
  descricao: string;
  cor: string;
  ativo: boolean;
  createdAt: Date;
}

export interface InsertPromotion {
  texto: string;
  descricao: string;
  cor: string;
  ativo: boolean;
}

const STORAGE_KEY = 'promotions';

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPromotions = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : [];
      setPromotions(data.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt) })));
    } catch (error) {
      console.error('Failed to load promotions:', error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const createPromotion = (promotionData: InsertPromotion): Promotion => {
    const newPromotion: Promotion = {
      id: crypto.randomUUID(),
      ...promotionData,
      createdAt: new Date(),
    };

    // Se a nova promoção está ativa, desativar todas as outras
    const updatedPromotions = promotions.map(p => ({
      ...p,
      ativo: promotionData.ativo ? false : p.ativo
    }));

    const allPromotions = [...updatedPromotions, newPromotion];
    setPromotions(allPromotions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPromotions));
    
    return newPromotion;
  };

  const updatePromotion = (id: string, promotionData: Partial<InsertPromotion>) => {
    const updatedPromotions = promotions.map(p => {
      if (p.id === id) {
        return { ...p, ...promotionData };
      }
      // Se a promoção sendo editada está sendo ativada, desativar as outras
      if (promotionData.ativo === true && p.ativo) {
        return { ...p, ativo: false };
      }
      return p;
    });

    setPromotions(updatedPromotions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPromotions));
  };

  const deletePromotion = (id: string) => {
    const filteredPromotions = promotions.filter(p => p.id !== id);
    setPromotions(filteredPromotions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPromotions));
  };

  const getActivePromotion = (): Promotion | null => {
    return promotions.find(p => p.ativo) || null;
  };

  return {
    promotions,
    loading,
    createPromotion,
    updatePromotion,
    deletePromotion,
    getActivePromotion,
  };
}
