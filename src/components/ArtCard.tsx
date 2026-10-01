import { Bookmark, BookOpen, Eye, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Art } from "../types";
import { Badge } from "./ui";
import { formatNumber, truncate } from "../utils/media";
import { MediaImage } from "./MediaImage";

export function ArtCard({ art }: { art: Art }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/art/${art.id}`)}
      className="group w-full text-left"
    >
      <div className="overflow-hidden rounded-[14px] border border-[#e8e8eb] bg-white transition hover:-translate-y-0.5 hover:border-[#d9d0ff]">
        <div className="relative aspect-[2/3] overflow-hidden bg-[#efeff2]">
          <MediaImage
            src={art.cover_img}
            alt={art.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          />
          <div className="absolute left-2 top-2">
            <Badge>{art.category}</Badge>
          </div>
          {art.status && (
            <div className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-1 text-[9px] font-extrabold text-white backdrop-blur">
              {art.status}
            </div>
          )}
          <div className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-primary opacity-0 shadow-sm transition group-hover:opacity-100">
            <Bookmark size={13} fill="currentColor" />
          </div>
        </div>
        <div className="p-3">
          <h3 className="line-clamp-1 text-[13px] font-extrabold tracking-[-0.01em] text-[#25252b]">
            {art.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#8a8a92]">
            {truncate(art.tagline || art.synopsis || "", 95)}
          </p>
          <div className="mt-2.5 flex items-center justify-between gap-2 text-[10px] text-[#8a8a92]">
            <span className="flex items-center gap-1 text-[#e2a62d]">
              <Star size={12} fill="currentColor" />
              {Number(art.rata2_rating || 0).toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {formatNumber(art.total_reviews || 0)}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={12} />
              {art.jumlah_chapter || 0}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
export function HorizontalArtCard({
  art,
  showProgress = true,
}: {
  art: Art;
  showProgress?: boolean;
}) {
  const nav = useNavigate();
  const progress = Math.max(
    0,
    Math.min(100, Number(art.progress_percent || 0)),
  );
  return (
    <button
      onClick={() => nav(`/art/${art.id}`)}
      className="flex min-w-[270px] gap-3 rounded-[14px] border border-[#e8e8eb] bg-white p-3 text-left transition hover:border-[#d9d0ff] hover:shadow-sm"
    >
      <MediaImage
        src={art.cover_img}
        alt={art.title}
        className="h-20 w-14 rounded-[10px] object-cover"
      />
      <span className="min-w-0 flex-1 py-1">
        <span className="block truncate text-[13px] font-extrabold text-[#25252b]">
          {art.title}
        </span>
        <span className="mt-1 block text-[10px] text-[#8a8a92]">
          {art.category}
        </span>
        <span className="mt-3 flex items-center gap-2 text-[10px]">
          <span className="text-[#d99b22]">
            ★ {Number(art.rata2_rating || 0).toFixed(1)}
          </span>
          <span className="text-[#9b9ba2]">{progress}% selesai</span>
        </span>
        {showProgress && (
          <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-[#ececf0]">
            <span
              className="block h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </span>
        )}
      </span>
    </button>
  );
}
