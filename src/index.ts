import "./instrument";
import * as Sentry from "@sentry/node";
import express from "express";
import { wrapConsoleWithSentry } from "./lib/sentry-console-wrapper";
import { userRouter } from "./routes/users";
import { orderRouter } from "./routes/orders";
import { productRouter } from "./routes/products";
import { healthRouter } from "./routes/health";

wrapConsoleWithSentry();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/products", productRouter);

Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Demo API running on http://localhost:${PORT}`);
});
