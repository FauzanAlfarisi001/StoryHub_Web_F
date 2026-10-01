import { ArrowRight, BookOpen, Gamepad2, Sparkles, Tags } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storyhub } from "../api/storyhub";
import type { Art } from "../types";
import { ArtCard, HorizontalArtCard } from "../components/ArtCard";
import { MediaImage } from "../components/MediaImage";
import {
  Badge,
  Button,
  EmptyState,
  SectionTitle,
  Spinner,
} from "../components/ui";
import { truncate } from "../utils/media";

function HeroCard({
  art,
  kind,
}: {
  art?: Art;
  kind: "Game" | "Comic" | "Novel";
}) {
  const nav = useNavigate();
  if (!art)
    return <div className="h-[220px] animate-pulse rounded-3xl bg-gray-200" />;
  const action = kind === "Game" ? "Play Now" : "Read Now";
  return (
    <button
      onClick={() => nav(`/art/${art.id}`)}
      className="group relative h-[220px] w-full overflow-hidden rounded-3xl text-left shadow-lg sm:h-[280px]"
    >
      <MediaImage
        src={art.banner_img || art.cover_img}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/50 to-transparent" />
      <div className="absolute inset-0 flex max-w-xl flex-col justify-end p-5 sm:p-7">
        <div className="flex items-center gap-2">
          <Badge className="bg-white/10 text-white backdrop-blur">{kind}</Badge>
          <span className="text-xs text-gray-300">
            {art.total_reviews || 0} reviews
          </span>
        </div>
        <h2 className="mt-2 line-clamp-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
          {art.title}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-200">
          {truncate(art.tagline || art.synopsis || "", 170)}
        </p>
        <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-900">
          {action}
          <ArrowRight size={15} />
        </span>
      </div>
    </button>
  );
}

type FilterSectionProps = {
  title: string;
  icon: React.ReactNode;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  arts: Art[];
  emptyText: string;
  prefix?: string;
  tone?: "violet" | "sky" | "gray";
};
function FilterSection({
  title,
  icon,
  options,
  selected,
  onSelect,
  arts,
  emptyText,
  prefix = "",
  tone = "violet",
}: FilterSectionProps) {
  const selectedClass = "bg-primary text-white border-primary";
  const toneClass =
    tone === "sky"
      ? "bg-sky-50 text-sky-700 border-sky-100"
      : tone === "gray"
        ? "bg-gray-100 text-gray-700 border-gray-200"
        : "bg-violet-50 text-primary border-violet-100";
  return (
    <section>
      <SectionTitle
        title={
          <span className="inline-flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </span>
        }
        action={
          selected ? (
            <span className="text-[11px] font-semibold text-gray-400">
              Dipilih: {prefix}
              {selected}
            </span>
          ) : undefined
        }
      />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {options.map((value) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${value === selected ? selectedClass : toneClass}`}
          >
            {prefix}
            {value}
          </button>
        ))}
      </div>
      {arts.length ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {arts.map((a) => (
            <div
              key={a.id}
              className="w-[160px] shrink-0 sm:w-[172px] lg:w-[184px]"
            >
              <ArtCard art={a} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title={emptyText} />
      )}
    </section>
  );
}

export default function HomePage() {
  const [hero, setHero] = useState<{ game?: Art; comic?: Art; novel?: Art }>(
    {},
  );
  const [continueReading, setContinueReading] = useState<Art[]>([]);
  const [trending, setTrending] = useState<Art[]>([]);
  const [category, setCategory] = useState<{ label: string; data: Art[] }[]>(
    [],
  );
  const [moods, setMoods] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [moodArts, setMoodArts] = useState<Art[]>([]);
  const [genreArts, setGenreArts] = useState<Art[]>([]);
  const [tagArts, setTagArts] = useState<Art[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    const [game, comic, novel, cont, trend, m, g, t] = await Promise.allSettled(
      [
        storyhub.arts({
          page: 1,
          limit: 1,
          category: "Game,Visual Novel,Story Game",
        }),
        storyhub.arts({ page: 1, limit: 1, category: "Manhwa,Manga,Comic" }),
        storyhub.arts({ page: 1, limit: 1, category: "Novel,Book" }),
        storyhub.continueReading(),
        storyhub.arts({
          page: 1,
          limit: 5,
          urutan: "reviewersArt",
          order: "DESC",
        }),
        storyhub.moods(),
        storyhub.genres(),
        storyhub.tags(),
      ],
    );
    if (game.status === "fulfilled")
      setHero((v) => ({ ...v, game: game.value.data?.[0] }));
    if (comic.status === "fulfilled")
      setHero((v) => ({ ...v, comic: comic.value.data?.[0] }));
    if (novel.status === "fulfilled")
      setHero((v) => ({ ...v, novel: novel.value.data?.[0] }));
    if (cont.status === "fulfilled") setContinueReading(cont.value.data || []);
    if (trend.status === "fulfilled") setTrending(trend.value.data || []);
    if (m.status === "fulfilled") {
      const values = m.value.data.map((x) => x.mood);
      setMoods(values);
      setSelectedMood(values[0] || "");
    }
    if (g.status === "fulfilled") {
      const values = g.value.data.map((x) => x.genre);
      setGenres(values);
      setSelectedGenre(values[0] || "");
    }
    if (t.status === "fulfilled") {
      const values = t.value.data.map((x) => x.tag);
      setTags(values);
      setSelectedTag(values[0] || "");
    }
    const cats = [
      "Novel,Book",
      "Manhwa,Manga,Comic",
      "Game,Visual Novel,Story Game",
    ];
    const results = await Promise.all(
      cats.map((c) =>
        storyhub
          .arts({
            page: 1,
            limit: 6,
            category: c,
            urutan: "ratingArt",
            order: "DESC",
          })
          .catch(() => ({ data: [] }) as any),
      ),
    );
    setCategory(
      results.map((r, i) => ({
        label: ["Novel", "Comic", "Game"][i],
        data: r.data || [],
      })),
    );
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (!selectedMood) return;
    storyhub
      .arts({
        page: 1,
        limit: 12,
        genre: null,
        tag: null,
        mood: selectedMood,
        urutan: "ratingArt",
        order: "ASC",
      })
      .then((r) => setMoodArts(r.data || []))
      .catch(() => setMoodArts([]));
  }, [selectedMood]);
  useEffect(() => {
    if (!selectedGenre) return;
    storyhub
      .arts({
        page: 1,
        limit: 12,
        genre: selectedGenre,
        tag: null,
        mood: null,
        urutan: "ratingArt",
        order: "ASC",
      })
      .then((r) => setGenreArts(r.data || []))
      .catch(() => setGenreArts([]));
  }, [selectedGenre]);
  useEffect(() => {
    if (!selectedTag) return;
    storyhub
      .arts({
        page: 1,
        limit: 12,
        genre: null,
        tag: selectedTag,
        mood: null,
        urutan: "ratingArt",
        order: "ASC",
      })
      .then((r) => setTagArts(r.data || []))
      .catch(() => setTagArts([]));
  }, [selectedTag]);
  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Spinner /> Menyiapkan beranda…
        </div>
      </div>
    );
  return (
    <div className="w-full space-y-10">
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black sm:text-3xl">
              Menemukan masterpiece di antara cerita indie.
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Jelajahi karya indie, lanjutkan bacaan, dan temukan cerita
              berikutnya.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navTo("/discover")}
            className="hidden sm:inline-flex"
          >
            Explore <ArrowRight size={15} />
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <HeroCard art={hero.game} kind="Game" />
          <HeroCard art={hero.comic} kind="Comic" />
          <HeroCard art={hero.novel} kind="Novel" />
        </div>
      </section>
      {continueReading.length > 0 && (
        <section>
          <SectionTitle
            title="Continue Reading"
            action={
              <Button variant="ghost" onClick={() => navTo("/my-list")}>
                Lihat semua <ArrowRight size={14} />
              </Button>
            }
          />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {continueReading.slice(0, 6).map((a) => (
              <HorizontalArtCard
                key={`${a.id}-${a.latest_chapter_id}`}
                art={a}
              />
            ))}
          </div>
        </section>
      )}
      <section>
        <SectionTitle
          title="Trending Now"
          action={
            <Button variant="ghost" onClick={() => navTo("/discover")}>
              Discover <ArrowRight size={14} />
            </Button>
          }
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {trending.map((a) => (
            <ArtCard key={a.id} art={a} />
          ))}
        </div>
      </section>
      {category.map((sec) => (
        <section key={sec.label}>
          <SectionTitle
            title={sec.label}
            action={
              <Button
                variant="ghost"
                onClick={() =>
                  navTo(`/discover?category=${encodeURIComponent(sec.label)}`)
                }
              >
                Lihat selengkapnya <ArrowRight size={14} />
              </Button>
            }
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {sec.data.map((a) => (
              <ArtCard key={a.id} art={a} />
            ))}
          </div>
        </section>
      ))}
      <FilterSection
        title="Mood"
        icon={<Gamepad2 size={20} />}
        options={moods}
        selected={selectedMood}
        onSelect={setSelectedMood}
        arts={moodArts}
        emptyText={
          selectedMood
            ? `Belum ada karya dengan mood ${selectedMood}.`
            : "Mood belum tersedia."
        }
        tone="gray"
      />
      <FilterSection
        title="Genre"
        icon={<BookOpen size={20} />}
        options={genres}
        selected={selectedGenre}
        onSelect={setSelectedGenre}
        arts={genreArts}
        emptyText={
          selectedGenre
            ? `Belum ada karya dengan genre ${selectedGenre}.`
            : "Genre belum tersedia."
        }
        tone="violet"
      />
      <FilterSection
        title="Tag"
        icon={<Tags size={20} />}
        options={tags}
        selected={selectedTag}
        onSelect={setSelectedTag}
        arts={tagArts}
        emptyText={
          selectedTag
            ? `Belum ada karya dengan tag #${selectedTag}.`
            : "Tag belum tersedia."
        }
        prefix="#"
        tone="sky"
      />
    </div>
  );
}
function navTo(path: string) {
  window.location.href = path;
}
