import { Filter, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { storyhub } from "../api/storyhub";
import type { Art, Chapter } from "../types";
import { ArtCard } from "../components/ArtCard";
import {
  Button,
  Card,
  EmptyState,
  SectionTitle,
  Spinner,
} from "../components/ui";
import { ChapterRow } from "../components/ChapterRow";
import { MediaImage } from "../components/MediaImage";
import { mediaUrl } from "../utils/media";

const categories = [
  "Book",
  "Novel",
  "Manhwa",
  "Manga",
  "Comic",
  "Game",
  "Visual Novel",
  "Story Game",
];
const artSorts = [
  ["title", "Title"],
  ["ratingArt", "Rating Art"],
  ["reviewersArt", "Reviewer Art"],
  ["ratingChapter", "Rating Chapter"],
  ["reviewersChapter", "Reviewer Chapter"],
  ["chapters", "Jumlah Chapter"],
  ["published", "Tanggal Terbit"],
  ["ratingArtUser", "Rating Saya"],
  ["reviewersArtUser", "Review Saya"],
  ["ratingChapterUser", "Rating Chapter Saya"],
  ["reviewersChapterUser", "Review Chapter Saya"],
];
const chapterSorts = [
  ["title", "Title"],
  ["ratingChapter", "Rating Chapter"],
  ["reviewersChapter", "Reviewer Chapter"],
  ["chapters", "Jumlah Chapter"],
  ["published", "Tanggal Terbit"],
  ["ratingChapterUser", "Rating Saya"],
  ["reviewersChapterUser", "Review Saya"],
];

type Tab = "art" | "chapter";

export function BookmarksPage() {
  const [items, setItems] = useState<any[]>([]);
  const [cat, setCat] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    storyhub
      .bookmarks(cat || undefined)
      .then((r) => setItems(r.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [cat]);
  const cats = [
    ["", "All"],
    ["novel", "Novel"],
    ["manga", "Manga"],
    ["manhwa", "Manhwa"],
    ["comic", "Comic"],
    ["game", "Game"],
    ["chapter", "Chapter"],
  ];
  return (
    <div className="space-y-5">
      <div>
        <SectionTitle
          title="Bookmark"
          action={
            <span className="text-sm text-gray-500">{items.length} item</span>
          }
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {cats.map(([v, l]) => (
            <button
              key={v}
              onClick={() => setCat(v)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${cat === v ? "bg-primary text-white" : "border border-gray-200 bg-white text-gray-500"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : items.length ? (
        cat === "chapter" ? (
          <div className="space-y-3">
            {items.map((c: any) => (
              <ChapterRow
                key={c.id}
                chapter={{
                  ...c,
                  chapter_number: Number(c.chapter_number || 0),
                  art_id: Number(c.art_id || 0),
                  title: c.title || `Chapter ${c.chapter_number || ""}`,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {items.map((a) => (
              <ArtCard key={a.id} art={a} />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title="Bookmark masih kosong"
          text={
            cat === "chapter"
              ? "Simpan chapter untuk muncul di sini."
              : "Simpan karya dari halaman detail untuk muncul di sini."
          }
        />
      )}
    </div>
  );
}

export function MyListPage() {
  return <AuthenticatedMyList />;
}

function AuthenticatedMyList() {
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const tab = (sp.get("tab") === "chapter" ? "chapter" : "art") as Tab;
  const [arts, setArts] = useState<Art[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, total_pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string[]>(
    sp.get("category")?.split(",").filter(Boolean) || [],
  );
  const [genre, setGenre] = useState<string[]>(
    sp.get("genre")?.split(",").filter(Boolean) || [],
  );
  const [tag, setTag] = useState<string[]>(
    sp.get("tag")?.split(",").filter(Boolean) || [],
  );
  const [mood, setMood] = useState<string[]>(
    sp.get("mood")?.split(",").filter(Boolean) || [],
  );
  const [reviewStatus, setReviewStatus] = useState(
    sp.get("sudahDiReview") || "all",
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
      if (g.status === "fulfilled") setGenres(g.value.data.map((x) => x.genre));
      if (t.status === "fulfilled") setTags(t.value.data.map((x) => x.tag));
      if (m.status === "fulfilled") setMoods(m.value.data.map((x) => x.mood));
    });
  }, []);

  const params = useMemo(
    () => ({
      page: Number(sp.get("page") || 1),
      limit: 20,
      category: category.join(","),
      genre: genre.join(","),
      tag: tag.join(","),
      mood: mood.join(","),
      urutan:
        tab === "art"
          ? sort
          : [
                "title",
                "ratingChapter",
                "reviewersChapter",
                "chapters",
                "published",
                "ratingChapterUser",
                "reviewersChapterUser",
              ].includes(sort)
            ? sort
            : "title",
      order,
      sudahDiReview:
        tab === "art" && reviewStatus !== "all"
          ? reviewStatus === "reviewed"
            ? "true"
            : "false"
          : undefined,
    }),
    [sp, category, genre, tag, mood, sort, order, tab, reviewStatus],
  );

  useEffect(() => {
    setLoading(true);
    const request =
      tab === "art" ? storyhub.arts(params) : storyhub.chapterList(params);
    request
      .then((r: any) => {
        if (tab === "art") setArts(r.data || []);
        else setChapters(r.data || []);
        setMeta(r.meta || { page: 1, total_pages: 1, total: 0 });
      })
      .catch(() => {
        if (tab === "art") setArts([]);
        else setChapters([]);
        setMeta({ page: 1, total_pages: 1, total: 0 });
      })
      .finally(() => setLoading(false));
  }, [params, tab]);

  const apply = () => {
    const next: Record<string, string> = { tab, page: "1", order };
    if (category.length) next.category = category.join(",");
    if (genre.length) next.genre = genre.join(",");
    if (tag.length) next.tag = tag.join(",");
    if (mood.length) next.mood = mood.join(",");
    if (reviewStatus !== "all" && tab === "art")
      next.sudahDiReview = reviewStatus;
    next.urutan = sort;
    setSp(next);
    setOpen(false);
  };
  const reset = () => {
    setCategory([]);
    setGenre([]);
    setTag([]);
    setMood([]);
    setReviewStatus("all");
    setSort("title");
    setOrder("ASC");
    setSp({ tab, page: "1" });
  };
  const setTab = (next: Tab) => {
    setSp({ tab: next, page: "1" });
    if (next === "chapter" && !chapterSorts.some(([v]) => v === sort))
      setSort("title");
  };
  const toggle = (
    selected: string[],
    value: string,
    setter: (v: string[]) => void,
  ) =>
    setter(
      selected.includes(value)
        ? selected.filter((x) => x !== value)
        : [...selected, value],
    );
  const goPage = (page: number) =>
    setSp((s) => {
      const n = Object.fromEntries(s);
      n.page = String(page);
      return n;
    });
  const sortOptions = tab === "art" ? artSorts : chapterSorts;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionTitle title="My List" />
          <p className="-mt-3 text-sm text-gray-500">
            Cari daftar karya dan chapter dengan filter dan urutan yang kamu
            inginkan.
          </p>
        </div>
        <Button
          variant={open ? "secondary" : "ghost"}
          onClick={() => setOpen((v) => !v)}
        >
          <Filter size={16} />
          {open ? "Tutup Filter" : "Filter & Sort"}
        </Button>
      </div>
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab("art")}
          className={`border-b-2 px-4 py-3 text-sm font-bold ${tab === "art" ? "border-primary text-primary" : "border-transparent text-gray-500"}`}
        >
          Art
        </button>
        <button
          onClick={() => setTab("chapter")}
          className={`border-b-2 px-4 py-3 text-sm font-bold ${tab === "chapter" ? "border-primary text-primary" : "border-transparent text-gray-500"}`}
        >
          Chapter
        </button>
      </div>
      {open && (
        <Card className="p-4 sm:p-5">
          <div className="grid gap-5 lg:grid-cols-4">
            <FilterGroup title="Kategori">
              <ChipList
                values={categories}
                selected={category}
                toggle={(v) => toggle(category, v, setCategory)}
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
            {tab === "art" && (
              <label className="text-sm font-semibold">
                Status Review
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5"
                >
                  <option value="all">Semua</option>
                  <option value="reviewed">Sudah direview</option>
                  <option value="unreviewed">Belum direview</option>
                </select>
              </label>
            )}
            <label className="text-sm font-semibold">
              Urutkan
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5"
              >
                {sortOptions.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Order
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5"
              >
                <option>ASC</option>
                <option>DESC</option>
              </select>
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={reset}>
              <RotateCcw size={15} /> Reset
            </Button>
            <Button onClick={apply}>Terapkan</Button>
          </div>
        </Card>
      )}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : tab === "art" ? (
        arts.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {arts.map((a) => (
              <ArtCard key={a.id} art={a} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Tidak ada art"
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
          title="Tidak ada chapter"
          text="Coba ubah filter atau urutan."
        />
      )}
      <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-3 text-xs text-gray-500 shadow-sm">
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
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: any }) {
  return (
    <div>
      <div className="mb-2 text-sm font-bold">{title}</div>
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
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${selected.includes(v) ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}
        >
          {prefix}
          {v}
        </button>
      ))}
    </div>
  );
}

export function MyWorksPage() {
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [items, setItems] = useState<Art[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const load = () => {
    setLoading(true);
    storyhub
      .myArts(status)
      .then((r) => setItems(r.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, [status]);
  const del = async (id: number) => {
    if (!confirm("Hapus karya ini?")) return;
    try {
      await storyhub.deleteArt(id);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <SectionTitle title="My Works" />
          <p className="-mt-3 text-sm text-gray-500">
            Kelola karya dan chapter yang kamu ciptakan.
          </p>
        </div>
        <Button onClick={() => nav("/create")}>
          <span>＋</span> Buat Karya
        </Button>
      </div>
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setStatus("published")}
          className={`border-b-2 px-4 py-3 text-sm font-bold ${status === "published" ? "border-primary text-primary" : "border-transparent text-gray-500"}`}
        >
          Published
        </button>
        <button
          onClick={() => setStatus("draft")}
          className={`border-b-2 px-4 py-3 text-sm font-bold ${status === "draft" ? "border-primary text-primary" : "border-transparent text-gray-500"}`}
        >
          Draft
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : items.length ? (
        <div className="space-y-3">
          {items.map((a) => (
            <Card key={a.id} className="flex gap-4 p-4">
              <MediaImage
                src={a.cover_img}
                className="h-28 w-20 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary">
                    {a.category}
                  </span>
                  <span className="text-xs text-gray-400">{a.isPublished}</span>
                </div>
                <h3 className="mt-1 text-lg font-black">{a.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                  {a.tagline || a.synopsis}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => nav(`/edit/${a.id}`)}
                  >
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => nav(`/art/${a.id}`)}>
                    Preview
                  </Button>
                  <Button variant="ghost" onClick={() => nav(`/edit/${a.id}`)}>
                    Kelola Chapter
                  </Button>
                  <Button variant="danger" onClick={() => del(a.id)}>
                    <Trash2 size={15} /> Hapus
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            status === "published"
              ? "Belum ada karya terbit"
              : "Belum ada draft"
          }
          text="Buat karya pertama kamu dari tombol di atas."
        />
      )}
    </div>
  );
}
