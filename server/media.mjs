import { Readable } from "node:stream";

function normalizeUrl(value, fallback) {
  const raw = String(value || fallback).trim();
  return raw.replace(/^((https?:)\/\/)+/i, "$2//").replace(/\/$/, "");
}

export async function proxyMedia(req, res, next, gateway) {
  const relative = decodeURIComponent(
    String(req.url || "").replace(/^\/+/, ""),
  );
  if (!relative) return next?.();
  const artImage = normalizeUrl(
    process.env.STORYHUB_IMAGE_URL,
    "http://127.0.0.1:4297/image",
  );
  const authImage = normalizeUrl(
    process.env.STORYHUB_AUTH_IMAGE_URL,
    "http://127.0.0.1:4197/image",
  );
  const basePaths = String(
    process.env.STORYHUB_IMAGE_BASE_PATHS ||
      "/api/image,/image,/images,/uploads,/assets",
  )
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  const candidates = [
    `${artImage}/${relative}`,
    `${authImage}/${relative}`,
    ...basePaths.map(
      (base) =>
        `${normalizeUrl(gateway, gateway)}/${base.replace(/^\/+/, "")}/${relative}`,
    ),
  ];
  for (const url of [...new Set(candidates)]) {
    try {
      const auth = req.headers.authorization;
      const upstream = await fetch(url, {
        headers: auth ? { authorization: auth } : {},
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
      if (upstream.body) Readable.fromWeb(upstream.body).pipe(res);
      else res.end(Buffer.from(await upstream.arrayBuffer()));
      return;
    } catch {
    }
  }
  next?.();
}
