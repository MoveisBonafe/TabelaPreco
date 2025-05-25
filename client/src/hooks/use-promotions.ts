
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

async function fetchPromotions(): Promise<Promotion[]> {
  const response = await fetch('/api/promotions');
  if (!response.ok) {
    throw new Error('Failed to fetch promotions');
  }
  const data = await response.json();
  return data.map((p: any) => ({
    ...p,
    createdAt: new Date(p.createdAt)
  }));
}

async function createPromotionAPI(promotionData: InsertPromotion): Promise<Promotion> {
  const response = await fetch('/api/promotions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(promotionData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create promotion');
  }
  
  const data = await response.json();
  return {
    ...data,
    createdAt: new Date(data.createdAt)
  };
}

async function updatePromotionAPI(id: string, promotionData: Partial<InsertPromotion>): Promise<Promotion> {
  const response = await fetch(`/api/promotions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(promotionData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update promotion');
  }
  
  const data = await response.json();
  return {
    ...data,
    createdAt: new Date(data.createdAt)
  };
}

async function deletePromotionAPI(id: string): Promise<void> {
  const response = await fetch(`/api/promotions/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete promotion');
  }
}

export function usePromotions() {
  const queryClient = useQueryClient();

  const { data: promotions = [], isLoading: loading } = useQuery({
    queryKey: ['/api/promotions'],
    queryFn: fetchPromotions,
  });

  const createMutation = useMutation({
    mutationFn: createPromotionAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promotions'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertPromotion> }) =>
      updatePromotionAPI(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promotions'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePromotionAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promotions'] });
    },
  });

  const createPromotion = (promotionData: InsertPromotion) => {
    return createMutation.mutateAsync(promotionData);
  };

  const updatePromotion = (id: string, promotionData: Partial<InsertPromotion>) => {
    return updateMutation.mutateAsync({ id, data: promotionData });
  };

  const deletePromotion = (id: string) => {
    return deleteMutation.mutateAsync(id);
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
