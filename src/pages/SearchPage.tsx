import { Search as SearchIcon, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { storyhub } from "../api/storyhub";
import type { Art, Chapter, User } from "../types";
import { ArtCard } from "../components/ArtCard";
import { Badge, EmptyState, Input, Spinner } from "../components/ui";
import { UserAvatar } from "../components/UserAvatar";
import { MediaImage } from "../components/MediaImage";
import { mediaUrl } from "../utils/media";

export default function SearchPage() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";
  const [tab, setTab] = useState<"art" | "chapter" | "user">("art");
  const [arts, setArts] = useState<Art[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  useEffect(() => {
    if (!q) return;
    setLoading(true);
    Promise.allSettled([
      storyhub.arts({
        nyari: q,
        page: 1,
        limit: 20,
        urutan: "ratingArt",
        order: "DESC",
      }),
      storyhub.chapterList({
        nyari: q,
        page: 1,
        limit: 20,
        urutan: "ratingChapter",
        order: "DESC",
      }),
      storyhub.userSearch(q),
    ])
      .then(([a, c, u]) => {
        if (a.status === "fulfilled") setArts(a.value.data || []);
        if (c.status === "fulfilled") setChapters(c.value.data || []);
        if (u.status === "fulfilled") setUsers(u.value.data || []);
      })
      .finally(() => setLoading(false));
  }, [q]);
  return (
    <div className="space-y-5">
      <div>
        <Badge>
          <SearchIcon size={13} /> Search
        </Badge>
        <div className="mt-3 flex gap-2">
          <Input
            autoFocus
            defaultValue={q}
            placeholder="Cari story, chapter, user..."
            onKeyDown={(e) => {
              if (e.key === "Enter")
                setSp({ q: (e.currentTarget as HTMLInputElement).value });
            }}
          />
          <button className="rounded-xl bg-primary px-4 text-white">
            <SearchIcon size={18} />
          </button>
        </div>
      </div>
      <div className="flex gap-2 border-b border-gray-200">
        {[
          ["art", "Art"],
          ["chapter", "Chapter"],
          ["user", "User"],
        ].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v as any)}
            className={`border-b-2 px-4 py-3 text-sm font-bold ${tab === v ? "border-primary text-primary" : "border-transparent text-gray-500"}`}
          >
            {l}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          {tab === "art" &&
            (arts.length ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {arts.map((a) => (
                  <ArtCard key={a.id} art={a} />
                ))}
              </div>
            ) : (
              <EmptyState title="Art tidak ditemukan" />
            ))}
          {tab === "chapter" &&
            (chapters.length ? (
              <div className="space-y-3">
                {chapters.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => nav(`/read/${c.art_id}/${c.chapter_number}`)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-soft"
                  >
                    <MediaImage
                      src={c.cover_img}
                      className="h-16 w-11 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-primary">
                        Chapter {c.chapter_number}
                      </div>
                      <div className="font-bold">
                        {c.chapter_title || c.title}
                      </div>
                      <div className="text-sm text-gray-500">{c.art_title}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState title="Chapter tidak ditemukan" />
            ))}
          {tab === "user" &&
            (users.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => nav(`/user/${u.username}`)}
                    className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-soft"
                  >
                    <UserAvatar user={u} />
                    <div className="min-w-0">
                      <div className="truncate font-bold">{u.name}</div>
                      <div className="truncate text-sm text-gray-500">
                        @{u.username}
                      </div>
                    </div>
                    <UserRound className="ml-auto text-gray-300" size={18} />
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState title="User tidak ditemukan" />
            ))}
        </>
      )}
    </div>
  );
}
