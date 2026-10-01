import {
  Filter,
  RotateCcw,
  Search as SearchIcon,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { storyhub } from "../api/storyhub";
import type { Art, Chapter, User } from "../types";
import { ArtCard } from "../components/ArtCard";
import { UserAvatar } from "../components/UserAvatar";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Spinner,
} from "../components/ui";
import { ChapterRow } from "../components/ChapterRow";
import { useAuth } from "../context/AuthContext";

const categories = [
  "Novel",
  "Manga",
  "Manhwa",
  "Comic",
  "Game",
  "Visual Novel",
  "Story Game",
];

const sorts = [
  ["title", "Abjad"],
  ["ratingArt", "Rating Art"],
  ["reviewersArt", "Jumlah Reviewer Art"],
  ["ratingChapter", "Rating Chapter"],
  ["reviewersChapter", "Jumlah Reviewer Chapter"],
  ["chapters", "Jumlah Chapter"],
  ["published", "Tanggal Terbit"],
];

type Tab = "art" | "chapter" | "user";

type UserSection = {
  title: string;
  users: User[];
};

export default function DiscoverPage() {
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();

  const { user: currentUser } = useAuth();

  const tab = (sp.get("tab") as Tab) || "art";

  const [arts, setArts] = useState<Art[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [userSections, setUserSections] = useState<UserSection[]>([]);

  const [userQuery, setUserQuery] = useState(sp.get("user_q") || "");
  const [userLoading, setUserLoading] = useState(false);

  const [meta, setMeta] = useState<any>({
    page: 1,
    total_pages: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [genre, setGenre] = useState<string[]>(
    sp.get("genre")?.split(",").filter(Boolean) || [],
  );

  const [tag, setTag] = useState<string[]>(
    sp.get("tag")?.split(",").filter(Boolean) || [],
  );

  const [mood, setMood] = useState<string[]>(
    sp.get("mood")?.split(",").filter(Boolean) || [],
  );

  const [cat, setCat] = useState<string[]>(
    sp.get("category")?.split(",").filter(Boolean) || [],
  );

  const [sort, setSort] = useState(sp.get("urutan") || "title");

  const [order, setOrder] = useState(sp.get("order") || "ASC");

  const [genres, setGenres] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);

  useEffect(() => {
    Promise.allSettled([
      storyhub.genres(),
      storyhub.tags(),
      storyhub.moods(),
    ]).then(([g, t, m]) => {
      if (g.status === "fulfilled") {
        setGenres(g.value.data.map((x) => x.genre));
      }

      if (t.status === "fulfilled") {
        setTags(t.value.data.map((x) => x.tag));
      }

      if (m.status === "fulfilled") {
        setMoods(m.value.data.map((x) => x.mood));
      }
    });
  }, []);

  useEffect(() => {
    if (tab === "user") return;

    setLoading(true);

    const params = {
      page: Number(sp.get("page") || 1),
      limit: 12,
      category: cat.join(","),
      genre: genre.join(","),
      tag: tag.join(","),
      mood: mood.join(","),
      urutan: sort,
      order,
    };

    (tab === "art" ? storyhub.arts(params) : storyhub.chapterList(params))
      .then((r: any) => {
        if (tab === "art") {
          setArts(r.data || []);
        } else {
          setChapters(r.data || []);
        }

        setMeta(
          r.meta || {
            page: 1,
            total_pages: 1,
            total: 0,
          },
        );
      })
      .catch(() => {
        if (tab === "art") {
          setArts([]);
        } else {
          setChapters([]);
        }

        setMeta({
          page: 1,
          total_pages: 1,
          total: 0,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tab, sp, cat, genre, tag, mood, sort, order]);

  const loadDefaultUsers = async () => {
    setUserLoading(true);

    try {
      if (!currentUser) {
        try {
          const all = await storyhub.userSearch("");

          setUserSections([
            {
              title: "Semua User",
              users: all.data || [],
            },
          ]);
        } catch {
          setUserSections([]);
        }

        return;
      }

      const [followingResult, followerResult, allResult] =
        await Promise.allSettled([
          storyhub.following(currentUser.id),

          storyhub.followers(currentUser.id),

          storyhub.userSearch(""),
        ]);

      const following =
        followingResult.status === "fulfilled"
          ? followingResult.value.data || []
          : [];

      const followers =
        followerResult.status === "fulfilled"
          ? followerResult.value.data || []
          : [];

      const all =
        allResult.status === "fulfilled" ? allResult.value.data || [] : [];

      const selfId = Number(currentUser.id);

      const seen = new Set<number>();

      seen.add(selfId);

      const first = uniqueUsers(following).filter((user) => {
        const id = Number(user.id);

        if (seen.has(id)) {
          return false;
        }

        seen.add(id);

        return true;
      });

      const second = uniqueUsers(followers).filter((user) => {
        const id = Number(user.id);

        if (seen.has(id)) {
          return false;
        }

        seen.add(id);

        return true;
      });

      const rest = uniqueUsers(all).filter((user) => {
        const id = Number(user.id);

        if (seen.has(id)) {
          return false;
        }

        seen.add(id);

        return true;
      });

      setUserSections(
        [
          {
            title: "Mengikuti",
            users: first,
          },
          {
            title: "Mengikuti Kamu",
            users: second,
          },
          {
            title: "User Lainnya",
            users: rest,
          },
        ].filter((section) => section.users.length > 0),
      );
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    if (tab !== "user") return;

    const query = userQuery.trim();

    if (!query) {
      void loadDefaultUsers();

      return;
    }

    setUserLoading(true);

    storyhub
      .userSearch(query)

      .then((r) => {
        setUserSections([
          {
            title: `Hasil untuk "${query}"`,
            users: r.data || [],
          },
        ]);
      })

      .catch(() => {
        setUserSections([]);
      })

      .finally(() => {
        setUserLoading(false);
      });
  }, [tab, userQuery, currentUser?.id]);

  const apply = () => {
    setSp({
      tab,

      ...(genre.length ? { genre: genre.join(",") } : {}),

      ...(tag.length ? { tag: tag.join(",") } : {}),

      ...(mood.length ? { mood: mood.join(",") } : {}),

      ...(cat.length ? { category: cat.join(",") } : {}),

      urutan: sort,
      order,
      page: "1",
    });

    setFilterOpen(false);
  };

  const reset = () => {
    setGenre([]);
    setTag([]);
    setMood([]);
    setCat([]);
    setSort("title");
    setOrder("ASC");

    setSp({
      tab,
      page: "1",
    });
  };

  const toggle = (
    list: string[],
    value: string,
    setter: (v: string[]) => void,
  ) => {
    setter(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  };

  const goTab = (next: Tab) => {
    setFilterOpen(false);

    setSp({
      tab: next,
      page: "1",
    });

    if (next !== "user") {
      setUserQuery("");
    }
  };

  const goPage = (page: number) =>
    setSp((s) => ({
      ...Object.fromEntries(s),
      page: String(page),
    }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge>
            <SlidersHorizontal size={12} />
            Discover
          </Badge>

          <h1 className="mt-2 text-[27px] font-extrabold tracking-[-0.04em]">
            Temukan cerita indie hidden gem.
          </h1>

          <p className="mt-1 max-w-xl text-[12px] leading-5 text-[#85858d]">
            Mencari semua novel, komik, atau game.
          </p>
        </div>

        {tab !== "user" && (
          <Button
            variant={filterOpen ? "secondary" : "ghost"}
            onClick={() => setFilterOpen((v) => !v)}
          >
            <Filter size={15} />
            {filterOpen ? "Tutup Filter" : "Filter & Sort"}
          </Button>
        )}
      </div>

      <div className="flex gap-1 border-b border-[#e5e5e8]">
        <Tab active={tab === "art"} onClick={() => goTab("art")}>
          Art
        </Tab>

        <Tab active={tab === "chapter"} onClick={() => goTab("chapter")}>
          Chapter
        </Tab>

        <Tab active={tab === "user"} onClick={() => goTab("user")}>
          User
        </Tab>
      </div>

      {tab === "user" ? (
        <UserDiscover
          query={userQuery}
          setQuery={setUserQuery}
          sections={userSections}
          loading={userLoading}
          nav={nav}
        />
      ) : (
        <>
          {filterOpen && (
            <Card className="p-4 sm:p-5">
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <FilterGroup title="Kategori">
                  <ChipList
                    values={categories}
                    selected={cat}
                    toggle={(v) => toggle(cat, v, setCat)}
                  />
                </FilterGroup>

                <FilterGroup title="Genre">
                  <ChipList
                    values={genres}
                    selected={genre}
                    toggle={(v) => toggle(genre, v, setGenre)}
                  />
                </FilterGroup>

                <FilterGroup title="Tag">
                  <ChipList
                    values={tags}
                    selected={tag}
                    toggle={(v) => toggle(tag, v, setTag)}
                    prefix="#"
                  />
                </FilterGroup>

                <FilterGroup title="Mood">
                  <ChipList
                    values={moods}
                    selected={mood}
                    toggle={(v) => toggle(mood, v, setMood)}
                  />
                </FilterGroup>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <label className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#77777f]">
                  Urutkan
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="mt-2 h-11 w-full rounded-[11px] border border-[#e4e4e8] bg-white px-3 text-[12px] text-[#33333a] outline-none"
                  >
                    {sorts.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#77777f]">
                  Order
                  <select
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="mt-2 h-11 w-full rounded-[11px] border border-[#e4e4e8] bg-white px-3 text-[12px] text-[#33333a] outline-none"
                  >
                    <option>ASC</option>
                    <option>DESC</option>
                  </select>
                </label>

                <div className="flex items-end justify-end gap-2">
                  <Button variant="secondary" onClick={reset}>
                    <RotateCcw size={14} />
                    Reset
                  </Button>

                  <Button onClick={apply}>Terapkan</Button>
                </div>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : tab === "art" ? (
            arts.length ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {arts.map((a) => (
                  <ArtCard key={a.id} art={a} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Belum ada art"
                text="Coba ubah filter atau urutan."
              />
            )
          ) : chapters.length ? (
            <div className="space-y-3">
              {chapters.map((c) => (
                <ChapterRow key={c.id} chapter={c} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum ada chapter"
              text="Coba ubah filter atau urutan."
            />
          )}

          <div className="flex items-center justify-between rounded-[14px] border border-[#e8e8eb] bg-white p-3 text-[11px] text-[#88888f]">
            <span>
              {meta.total || 0} hasil · halaman {meta.page || 1} /{" "}
              {meta.total_pages || 1}
            </span>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={(meta.page || 1) <= 1}
                onClick={() => goPage((meta.page || 1) - 1)}
              >
                ‹
              </Button>

              <Button
                variant="secondary"
                disabled={(meta.page || 1) >= (meta.total_pages || 1)}
                onClick={() => goPage((meta.page || 1) + 1)}
              >
                ›
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function uniqueUsers(users: User[]) {
  const seen = new Set<number>();

  return users.filter((user) => {
    const id = Number(user.id);

    if (seen.has(id)) {
      return false;
    }

    seen.add(id);

    return true;
  });
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: any;
}) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-4 py-3 text-[12px] font-extrabold ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-[#85858d]"
      }`}
    >
      {children}
    </button>
  );
}

function FilterGroup({ title, children }: { title: string; children: any }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#77777f]">
        {title}
      </div>

      {children}
    </div>
  );
}

function ChipList({
  values,
  selected,
  toggle,
  prefix = "",
}: {
  values: string[];
  selected: string[];
  toggle: (v: string) => void;
  prefix?: string;
}) {
  return (
    <div className="flex max-h-32 flex-wrap gap-2 overflow-auto">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => toggle(v)}
          className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
            selected.includes(v)
              ? "bg-primary text-white"
              : "bg-[#f3f3f5] text-[#696970]"
          }`}
        >
          {prefix}
          {v}
        </button>
      ))}
    </div>
  );
}

function UserDiscover({
  query,
  setQuery,
  sections,
  loading,
  nav,
}: {
  query: string;
  setQuery: (v: string) => void;
  sections: UserSection[];
  loading: boolean;
  nav: (to: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="relative">
          <SearchIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a2a2a9]"
          />

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari username atau nama..."
            className="pl-9"
          />
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : sections.length ? (
        <div className="space-y-5">
          {sections.map((section) => (
            <section key={section.title}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[12px] font-extrabold uppercase tracking-[0.13em] text-[#86868e]">
                  {section.title}
                </h2>

                <span className="text-[10px] font-bold text-[#adadb4]">
                  {section.users.length} user
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {section.users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => nav(`/user/${u.username}`)}
                    className="flex items-center gap-3 rounded-[14px] border border-[#e8e8eb] bg-white p-4 text-left transition hover:border-[#d9d0ff]"
                  >
                    <UserAvatar user={u} />

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-extrabold">
                        {u.name || u.username}
                      </div>

                      <div className="truncate text-[11px] text-[#8c8c93]">
                        @{u.username}
                      </div>
                    </div>

                    <UserRound size={16} className="text-[#b0b0b6]" />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title={query ? "User tidak ditemukan" : "Belum ada user"}
          text={
            query
              ? "Tidak ada user yang cocok dengan pencarian."
              : "Belum ada user yang dapat ditampilkan."
          }
        />
      )}
    </div>
  );
}
