import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../lib/logger";

export const userRouter = Router();

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  createdAt: string;
}

const users: User[] = [
  {
    id: "u-001",
    name: "Alice Chen",
    email: "alice@demo.com",
    role: "admin",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "u-002",
    name: "Bob Martinez",
    email: "bob@demo.com",
    role: "member",
    createdAt: "2025-02-20T14:30:00Z",
  },
];

userRouter.get("/", (_req: Request, res: Response) => {
  logger.info("Fetching all users", { count: users.length });
  res.json({ users });
});

userRouter.get("/:id", (req: Request, res: Response) => {
  logger.info("Fetching user by ID", { userId: req.params.id });
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    logger.warn("User not found", { userId: req.params.id });
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ user });
});

userRouter.post("/", (req: Request, res: Response) => {
  const { name, email, role } = req.body;
  logger.info("Creating new user", { name, email, role });

  if (!name || !email) {
    logger.warn("User creation failed: missing fields", { name, email });
    res.status(400).json({ error: "Name and email are required" });
    return;
  }

  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    role: role || "member",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  res.status(201).json({ user: newUser });
});

userRouter.get("/:id/profile", (req: Request, res: Response) => {
  logger.info("Fetching user profile", { userId: req.params.id });
  const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    logger.warn("User not found", { userId: req.params.id });
    res.status(404).json({ error: "User not found" });
    return;
  }

  const profile = {
    ...user,
    displayName: user.name.toUpperCase(),
    isAdmin: user.role === "admin",
  };

  res.json({ profile });
});
