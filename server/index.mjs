import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
import { proxyMedia } from "./media.mjs";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 4173);
const gateway = process.env.STORYHUB_GATEWAY_URL || "http://127.0.0.1:4097";
const authService =
  process.env.STORYHUB_AUTH_SERVICE_URL || "http://127.0.0.1:4197";

app.disable("x-powered-by");
app.use("/media", (req, res, next) => proxyMedia(req, res, next, gateway));
app.use(
  "/api/verify",
  createProxyMiddleware({
    target: authService,
    changeOrigin: true,
    pathRewrite: { "^/": "/verify" },
  }),
);
app.use(
  "/api/refresh",
  createProxyMiddleware({
    target: authService,
    changeOrigin: true,
    pathRewrite: { "^/": "/refresh" },
  }),
);
app.use(
  "/api/logout",
  createProxyMiddleware({
    target: authService,
    changeOrigin: true,
    pathRewrite: { "^/": "/logout" },
  }),
);
app.use(
  "/api",
  createProxyMiddleware({
    target: gateway,
    changeOrigin: true,
    pathRewrite: { "^/api": "" },
  }),
);
const dist = path.resolve(__dirname, "../dist");
app.use(express.static(dist));
app.use((_req, res) => res.sendFile(path.join(dist, "index.html")));
app.listen(port, () =>
  console.log(
    `StoryHub Web berjalan di http://localhost:${port} -> ${gateway}`,
  ),
);
