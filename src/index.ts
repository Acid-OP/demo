import "./instrument";
import * as Sentry from "@sentry/node";
import express from "express";
import { logger } from "./lib/logger";
import { userRouter } from "./routes/users";
import { orderRouter } from "./routes/orders";
import { productRouter } from "./routes/products";
import { healthRouter } from "./routes/health";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use((req, _res, next) => {
  logger.info("Incoming request", {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

app.use("/api/health", healthRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/products", productRouter);

app.get("/debug-sentry", function mainHandler(_req, _res) {
  throw new Error("My first Sentry error!");
});

Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  logger.info("Server started", { port: Number(PORT) });
});
