import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCategorySchema, insertUserSchema } from "@shared/schema";
import { supabaseLogger, testSupabaseConnection } from "./supabase-logger";
import { getConnectionStatus } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByCredentials(username, password);
      
      if (user) {
        res.json({
          id: user.id,
          level: user.level,
          multiplier: parseFloat(user.multiplier || "1.0")
        });
      } else {
        res.status(401).json({ message: "Credenciais inválidas" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.json([]);
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await storage.deleteProduct(id);
      res.json({ message: "Produto excluído com sucesso" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(Array.isArray(categories) ? categories : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.json([]);
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Rotas de monitoramento do Supabase
  app.get("/api/supabase/status", async (req, res) => {
    try {
      const status = getConnectionStatus();
      res.json({
        ...status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    } catch (error) {
      console.error("Error getting Supabase status:", error);
      res.status(500).json({ message: "Falha ao obter status do Supabase" });
    }
  });

  app.get("/api/supabase/logs", async (req, res) => {
    try {
      const stats = supabaseLogger.getConnectionStats();
      const recentErrors = supabaseLogger.getRecentErrors(10);
      
      res.json({
        statistics: stats,
        recentErrors,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error getting Supabase logs:", error);
      res.status(500).json({ message: "Falha ao obter logs do Supabase" });
    }
  });

  app.post("/api/supabase/test", async (req, res) => {
    try {
      const { connectionString } = req.body;
      
      if (!connectionString) {
        return res.status(400).json({ message: "String de conexão é obrigatória" });
      }

      console.log('🧪 Testando conexão manual com Supabase...');
      const success = await testSupabaseConnection(connectionString);
      
      res.json({
        success,
        message: success ? "Conexão bem-sucedida!" : "Falha na conexão",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error testing Supabase connection:", error);
      res.status(500).json({ message: "Erro ao testar conexão" });
    }
  });

  app.get("/api/supabase/health-report", async (req, res) => {
    try {
      const report = supabaseLogger.generateHealthReport();
      res.json({
        report,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating health report:", error);
      res.status(500).json({ message: "Falha ao gerar relatório de saúde" });
    }
  });

  app.delete("/api/supabase/clear-logs", async (req, res) => {
    try {
      supabaseLogger.clearOldLogs();
      res.json({ message: "Logs limpos com sucesso!" });
    } catch (error) {
      console.error("Error clearing logs:", error);
      res.status(500).json({ message: "Falha ao limpar logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
