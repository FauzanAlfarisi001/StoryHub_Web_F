export const encodeMediaPath = (value: string) =>
  value.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/");

export const mediaUrl = (path?: string | null) => {
  if (!path) return "/storyhub-logo.png";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/media/")) return path;
  if (path.startsWith("/api/image/")) return path;
  if (path.startsWith("api/image/")) return `/${path}`;
  if (path.startsWith("/image/")) return `/api${path}`;
  return `/media/${encodeMediaPath(path)}`;
};

export const formatNumber = (n = 0) =>
  new Intl.NumberFormat("id-ID").format(Number(n) || 0);
export const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";
export const truncate = (v = "", n = 140) =>
  v.length > n ? `${v.slice(0, n - 1)}…` : v;
export const isComic = (category = "") => /manga|manhwa|comic/i.test(category);
export const isGame = (category = "") =>
  /^(game|story game|visual novel)$/i.test(category.trim());
