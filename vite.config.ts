import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { Readable } from "node:stream";

function normalizeUrl(value: string | undefined, fallback: string) {
  const raw = String(value || fallback).trim();
  return raw.replace(/^((https?:)\/\/)+/i, "$2//").replace(/\/$/, "");
}

async function mediaMiddleware(req: any, res: any, next: any) {
  const env = process.env;
  const artImage = normalizeUrl(
    env.STORYHUB_IMAGE_URL,
    "http://127.0.0.1:4297/image",
  );
  const authImage = normalizeUrl(
    env.STORYHUB_AUTH_IMAGE_URL,
    "http://127.0.0.1:4197/image",
  );
  const gateway = normalizeUrl(
    env.STORYHUB_GATEWAY_URL,
    "http://127.0.0.1:4097",
  );
  const relative = decodeURIComponent(
    String(req.url || "").replace(/^\/+/, ""),
  );
  const custom = String(env.STORYHUB_IMAGE_BASE_PATHS || "")
    .split(",")
    .map((v: string) => v.trim())
    .filter(Boolean);
  const candidates = [
    `${artImage}/${relative}`,
    `${authImage}/${relative}`,
    ...custom.map(
      (base: string) => `${gateway}/${base.replace(/^\/+/, "")}/${relative}`,
    ),
    `${gateway}/image/${relative}`,
    `${gateway}/images/${relative}`,
    `${gateway}/uploads/${relative}`,
    `${gateway}/assets/${relative}`,
  ];
  for (const upstreamUrl of candidates.filter(
    (candidate, index) => candidates.indexOf(candidate) === index,
  )) {
    try {
      const upstream = await fetch(upstreamUrl, {
        headers: req.headers.authorization
          ? { authorization: req.headers.authorization }
          : undefined,
      });
      const type = upstream.headers.get("content-type") || "";
      if (!upstream.ok || !type.startsWith("image/")) continue;
      res.statusCode = upstream.status;
      res.setHeader("Content-Type", type);
      res.setHeader(
        "Cache-Control",
        upstream.headers.get("cache-control") || "public, max-age=600",
      );
      const length = upstream.headers.get("content-length");
      if (length) res.setHeader("Content-Length", length);
      if (upstream.body) Readable.fromWeb(upstream.body as any).pipe(res);
      else res.end(Buffer.from(await upstream.arrayBuffer()));
      return;
    } catch {
    }
  }
  next();
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const gateway = normalizeUrl(
    env.STORYHUB_GATEWAY_URL,
    "http://127.0.0.1:4097",
  );
  const authService = normalizeUrl(
    env.STORYHUB_AUTH_SERVICE_URL,
    "http://127.0.0.1:4197",
  );
  process.env.STORYHUB_GATEWAY_URL = gateway;
  process.env.STORYHUB_AUTH_SERVICE_URL = authService;
  process.env.STORYHUB_IMAGE_URL = normalizeUrl(
    env.STORYHUB_IMAGE_URL,
    "http://127.0.0.1:4297/image",
  );
  process.env.STORYHUB_AUTH_IMAGE_URL = normalizeUrl(
    env.STORYHUB_AUTH_IMAGE_URL,
    "http://127.0.0.1:4197/image",
  );
  process.env.STORYHUB_IMAGE_BASE_PATHS =
    env.STORYHUB_IMAGE_BASE_PATHS ||
    "/api/image,/image,/images,/uploads,/assets";
  return {
    plugins: [
      react(),
      {
        name: "storyhub-media-proxy",
        configureServer(server) {
          server.middlewares.use("/media", mediaMiddleware);
        },
      },
    ],
    server: {
      port: 5173,
      proxy: {
        "/api/verify": {
          target: authService,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/api/refresh": {
          target: authService,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/api/logout": {
          target: authService,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/api": {
          target: gateway,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
