import express, { Request } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
import { authMiddleware } from "./lib/middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log(process.env.AUTH_SERVICE_URL);
app.use(
  "/auth/{*splat}",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req: Request) => {
      return req.originalUrl;
    },
    on: {
      proxyReq: (proxyReq: any, req: any) => {
        proxyReq.setHeader("origin", req.headers.origin || "http://localhost:3000");
      },
    },
  })
);

// Protected Routes
const protectedRoutes = ["/tickets", "/notifications", "/analytics"];

protectedRoutes.forEach((route) => {
  const targetEnvKey = `${route.replace("/", "").toUpperCase()}_SERVICE_URL`;
  const target = process.env[targetEnvKey];

  console.log(target);

  if (!target) {
    console.warn(`Target URL for ${route} not found in environment variables.`);
    return;
  }

  app.use(
    `${route}{*splat}`,
    authMiddleware,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: (path, req: Request) => {
        console.log(req.originalUrl, path);
        return req.originalUrl;
      },
      on: {
        proxyReq: (proxyReq: any, req: any) => {
          proxyReq.url = req.originalUrl;
          console.log(req.originalUrl, proxyReq.url);
          if (req.headers["x-user-id"]) {
            proxyReq.setHeader("x-user-id", req.headers["x-user-id"]);
          }
          if (req.headers["x-user-role"]) {
            proxyReq.setHeader("x-user-role", req.headers["x-user-role"]);
          }

          proxyReq.setHeader("origin", req.headers.origin || "http://localhost:3000");
        },
      },
    })
  );
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
