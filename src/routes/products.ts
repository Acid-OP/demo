import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../lib/logger";

export const productRouter = Router();

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

const products: Product[] = [
  {
    id: "p-001",
    name: "Wireless Keyboard",
    price: 29.99,
    stock: 150,
    category: "peripherals",
  },
  {
    id: "p-002",
    name: "27\" 4K Monitor",
    price: 99.99,
    stock: 42,
    category: "displays",
  },
  {
    id: "p-003",
    name: "USB-C Hub",
    price: 49.99,
    stock: 300,
    category: "peripherals",
  },
  {
    id: "p-004",
    name: "Noise Cancelling Headphones",
    price: 79.99,
    stock: 0,
    category: "audio",
  },
];

productRouter.get("/", (req: Request, res: Response) => {
  logger.info("Fetching products", { category: req.query.category || "all" });
  const { category } = req.query;

  if (category) {
    const filtered = products.filter((p) => p.category === category);
    res.json({ products: filtered });
    return;
  }

  res.json({ products });
});

productRouter.get("/:id", (req: Request, res: Response) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ product });
});

productRouter.post("/", (req: Request, res: Response) => {
  const { name, price, stock, category } = req.body;

  if (!name || price == null || stock == null || !category) {
    res.status(400).json({ error: "name, price, stock, and category are required" });
    return;
  }

  const newProduct: Product = {
    id: uuidv4(),
    name,
    price,
    stock,
    category,
  };

  products.push(newProduct);
  res.status(201).json({ product: newProduct });
});

productRouter.patch("/:id/stock", async (req: Request, res: Response) => {
  logger.info("Updating product stock", { productId: req.params.id, quantity: req.body.quantity });
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    logger.warn("Product not found for stock update", { productId: req.params.id });
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const { quantity } = req.body;
  if (typeof quantity !== "number") {
    res.status(400).json({ error: "quantity must be a number" });
    return;
  }

  product.stock += quantity;
  logger.info("Stock updated, syncing with inventory service", { productId: product.id, newStock: product.stock });

  try {
    const response = await fetch(`http://inventory-service:4000/api/sync/${product.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: product.stock }),
    });
    const syncResult = await response.json();
    console.log("Inventory sync result:", syncResult);
  } catch (err) {
    logger.warn("Inventory sync failed, continuing without sync", { productId: product.id, error: String(err) });
  }

  res.json({ product });
});
