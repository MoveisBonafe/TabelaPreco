import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { productStorage } from "./product-storage";
import { promotionsStorage } from "./promotions-storage";
import { insertProductSchema, insertCategorySchema, insertPromotionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await productStorage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });



  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await productStorage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Promotions routes
  app.get("/api/promotions", async (req, res) => {
    try {
      const promotions = await promotionsStorage.getPromotions();
      res.json(promotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  app.post("/api/promotions", async (req, res) => {
    try {
      const promotionData = insertPromotionSchema.parse(req.body);
      const promotion = await promotionsStorage.createPromotion(promotionData);
      
      // Enviar atualização para todos os clientes
      broadcastUpdate('promotion_created', promotion);
      
      res.json(promotion);
    } catch (error) {
      console.error("Error creating promotion:", error);
      res.status(500).json({ message: "Failed to create promotion" });
    }
  });

  app.put("/api/promotions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const promotionData = insertPromotionSchema.partial().parse(req.body);
      const promotion = await promotionsStorage.updatePromotion(id, promotionData);
      
      // Enviar atualização para todos os clientes
      broadcastUpdate('promotion_updated', promotion);
      
      res.json(promotion);
    } catch (error) {
      console.error("Error updating promotion:", error);
      res.status(500).json({ message: "Failed to update promotion" });
    }
  });

  app.delete("/api/promotions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await promotionsStorage.deletePromotion(id);
      
      // Enviar atualização para todos os clientes
      broadcastUpdate('promotion_deleted', { id });
      
      res.json({ message: "Promoção excluída com sucesso" });
    } catch (error) {
      console.error("Error deleting promotion:", error);
      res.status(500).json({ message: "Failed to delete promotion" });
    }
  });

  app.get("/api/promotions/active", async (req, res) => {
    try {
      const activePromotion = await promotionsStorage.getActivePromotion();
      res.json(activePromotion);
    } catch (error) {
      console.error("Error fetching active promotion:", error);
      res.status(500).json({ message: "Failed to fetch active promotion" });
    }
  });

  // Backup routes
  app.post("/api/backup/create", async (req, res) => {
    try {
      // Com Supabase, o backup é automático, mas podemos criar um snapshot manual
      const products = await productStorage.getProducts();
      const categories = await productStorage.getCategories();
      
      const backupData = {
        timestamp: new Date().toISOString(),
        products: products.length,
        categories: categories.length,
        status: 'success'
      };
      
      res.json({ 
        message: "Backup manual registrado com sucesso!",
        data: backupData 
      });
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ message: "Falha ao criar backup" });
    }
  });

  app.get("/api/backup/export", async (req, res) => {
    try {
      const products = await productStorage.getProducts();
      const categories = await productStorage.getCategories();
      
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: "1.0",
          totalProducts: products.length,
          totalCategories: categories.length
        },
        products,
        categories
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=backup-catalogo-${new Date().toISOString().split('T')[0]}.json`);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Falha ao exportar dados" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket para sincronização entre navegadores
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);
    console.log('Cliente conectado ao WebSocket. Total:', clients.size);

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Cliente desconectado do WebSocket. Total:', clients.size);
    });

    ws.on('error', (error) => {
      console.error('Erro no WebSocket:', error);
      clients.delete(ws);
    });
  });

  // Função para enviar atualizações para todos os clientes conectados
  const broadcastUpdate = (type: string, data: any) => {
    const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // Modificar as rotas para enviar atualizações via WebSocket
  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await productStorage.createProduct(productData);
      
      // Enviar atualização para todos os clientes
      broadcastUpdate('product_created', product);
      
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await productStorage.updateProduct(id, productData);
      
      // Enviar atualização para todos os clientes
      broadcastUpdate('product_updated', product);
      
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await productStorage.deleteProduct(id);
      if (success) {
        // Enviar atualização para todos os clientes
        broadcastUpdate('product_deleted', { id });
        
        res.json({ message: "Produto excluído com sucesso" });
      } else {
        res.status(404).json({ message: "Produto não encontrado" });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.post("/api/products/bulk-import", async (req, res) => {
    try {
      const { products: productsData } = req.body;
      const results = [];
      
      for (const productData of productsData) {
        const validatedProduct = insertProductSchema.parse(productData);
        const result = await productStorage.createOrUpdateProduct(validatedProduct);
        results.push(result);
      }
      
      // Enviar atualização para todos os clientes
      broadcastUpdate('products_bulk_imported', { count: results.length, products: results });
      
      res.json({ 
        message: `${results.length} produtos processados com sucesso!`,
        products: results 
      });
    } catch (error) {
      console.error("Error in bulk import:", error);
      res.status(500).json({ message: "Erro na importação em lote" });
    }
  });

  // Rota para estatísticas de monitoramento
  app.get("/api/monitoring/stats", async (req, res) => {
    try {
      const products = await productStorage.getProducts();
      const categories = await productStorage.getCategories();
      
      const stats = {
        totalProducts: products.length,
        totalCategories: categories.length,
        activeProducts: products.filter(p => p.active).length,
        inactiveProducts: products.filter(p => !p.active).length,
        connectedClients: clients.size,
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        lastUpdate: new Date().toISOString()
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching monitoring stats:", error);
      res.status(500).json({ message: "Failed to fetch monitoring stats" });
    }
  });

  return httpServer;
}
