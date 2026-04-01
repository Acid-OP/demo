import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

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

productRouter.patch("/:id/stock", (req: Request, res: Response) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const { quantity } = req.body;
  if (typeof quantity !== "number") {
    res.status(400).json({ error: "quantity must be a number" });
    return;
  }

  product.stock += quantity;
  res.json({ product });
});
