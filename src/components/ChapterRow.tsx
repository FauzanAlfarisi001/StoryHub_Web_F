import { BookOpen, ChevronRight, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Chapter } from "../types";
import { MediaImage } from "./MediaImage";

export function ChapterRow({ chapter }: { chapter: Chapter }) {
  const nav = useNavigate();
  const chapterTitle =
    chapter.chapter_title ||
    chapter.chapter_title ||
    chapter.title ||
    `Chapter ${chapter.chapter_number}`;

  return (
    <button
      type="button"
      onClick={() => nav(`/read/${chapter.art_id}/${chapter.chapter_number}`)}
      className="group flex w-full min-w-0 items-center gap-3 rounded-[14px] border border-[#e9e9ec] bg-white p-3 text-left transition hover:-translate-y-[1px] hover:border-[#d7ccff] hover:shadow-[0_8px_24px_rgba(38,38,45,.06)] sm:gap-4 sm:p-4"
    >
      <MediaImage
        src={chapter.cover_img}
        alt=""
        className="h-16 w-12 shrink-0 rounded-lg object-cover sm:h-20 sm:w-14"
      />
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.08em] text-primary sm:text-[11px]">
          <BookOpen size={12} />
        </div>
        <div className="mt-1 line-clamp-2 text-[13px] font-extrabold leading-5 text-[#28282e] sm:text-[14px]">
          Chapter {chapter.chapter_number} - {chapterTitle}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-[#919198] sm:text-[11px]">
          <span className="inline-flex items-center gap-1 text-[#e09a23]">
            <Star size={12} fill="currentColor" />{" "}
            {Number(chapter.rata2_rating_ch || 0).toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users size={12} /> {Number(chapter.total_reviews_ch || 0)}
          </span>
        </div>
      </div>
      <ChevronRight
        size={18}
        className="shrink-0 text-[#c3c3c8] transition group-hover:text-primary"
      />
    </button>
  );
}
