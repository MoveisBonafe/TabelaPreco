import { db } from "./db";
import { promotions } from "@shared/schema";
import type { Promotion, InsertPromotion } from "@shared/schema";
import { eq } from "drizzle-orm";

export class PromotionsStorage {
  async getPromotions(): Promise<Promotion[]> {
    const result = await db.select().from(promotions);
    return result.map(p => ({
      ...p,
      id: p.id.toString(),
      descricao: p.descricao || '',
      ativo: p.ativo ?? false,
      createdAt: p.createdAt || new Date(),
    }));
  }

  async createPromotion(promotionData: InsertPromotion): Promise<Promotion> {
    // If this promotion is being set as active, deactivate all others
    if (promotionData.ativo) {
      await db.update(promotions)
        .set({ ativo: false })
        .where(eq(promotions.ativo, true));
    }

    const [newPromotion] = await db.insert(promotions)
      .values(promotionData)
      .returning();

    return {
      ...newPromotion,
      id: newPromotion.id.toString(),
      descricao: newPromotion.descricao || '',
      ativo: newPromotion.ativo ?? false,
      createdAt: newPromotion.createdAt || new Date(),
    };
  }

  async updatePromotion(id: number, promotionData: Partial<InsertPromotion>): Promise<Promotion> {
    // If this promotion is being set as active, deactivate all others
    if (promotionData.ativo === true) {
      await db.update(promotions)
        .set({ ativo: false })
        .where(eq(promotions.ativo, true));
    }

    const [updatedPromotion] = await db.update(promotions)
      .set(promotionData)
      .where(eq(promotions.id, id))
      .returning();

    return {
      ...updatedPromotion,
      id: updatedPromotion.id.toString(),
      descricao: updatedPromotion.descricao || '',
      ativo: updatedPromotion.ativo ?? false,
      createdAt: updatedPromotion.createdAt || new Date(),
    };
  }

  async deletePromotion(id: number): Promise<void> {
    await db.delete(promotions).where(eq(promotions.id, id));
  }

  async getActivePromotion(): Promise<Promotion | null> {
    const [activePromotion] = await db.select()
      .from(promotions)
      .where(eq(promotions.ativo, true))
      .limit(1);

    if (!activePromotion) return null;

    return {
      ...activePromotion,
      id: activePromotion.id.toString(),
      descricao: activePromotion.descricao || '',
      ativo: activePromotion.ativo ?? false,
      createdAt: activePromotion.createdAt || new Date(),
    };
  }
}

export const promotionsStorage = new PromotionsStorage();