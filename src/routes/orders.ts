import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../lib/logger";

export const orderRouter = Router();

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: string;
}

const orders: Order[] = [
  {
    id: "ord-001",
    userId: "u-001",
    items: [
      { productId: "p-001", quantity: 2, price: 29.99 },
      { productId: "p-003", quantity: 1, price: 49.99 },
    ],
    total: 109.97,
    status: "shipped",
    createdAt: "2025-03-10T09:15:00Z",
  },
  {
    id: "ord-002",
    userId: "u-002",
    items: [{ productId: "p-002", quantity: 1, price: 99.99 }],
    total: 99.99,
    status: "pending",
    createdAt: "2025-03-28T16:45:00Z",
  },
];

orderRouter.get("/", (_req: Request, res: Response) => {
  logger.info("Fetching all orders", { count: orders.length });
  res.json({ orders });
});

orderRouter.get("/:id", (req: Request, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json({ order });
});

orderRouter.post("/", (req: Request, res: Response) => {
  const { userId, items } = req.body;
  logger.info("Creating new order", { userId, itemCount: items?.length, discountCode: req.body.discountCode });

  if (!userId || !items || !Array.isArray(items) || items.length === 0) {
    logger.warn("Order creation failed: missing fields", { userId, items });
    res.status(400).json({ error: "userId and items are required" });
    return;
  }

  const total = items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  const discount = (req.body.discountCode as string).toLowerCase() === "VIP10" ? 0.1 : 0;

  const newOrder: Order = {
    id: uuidv4(),
    userId,
    items,
    total: Math.round(total * (1 - discount) * 100) / 100,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  res.status(201).json({ order: newOrder });
});

orderRouter.patch("/:id/status", (req: Request, res: Response) => {
  logger.info("Updating order status", { orderId: req.params.id, newStatus: req.body.status });
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    logger.warn("Order not found for status update", { orderId: req.params.id });
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const { status } = req.body;
  const validStatuses = ["pending", "confirmed", "shipped", "delivered"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
    return;
  }

  order.status = status;
  res.json({ order });
});
