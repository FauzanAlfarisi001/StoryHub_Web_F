import { ImagePlus, Plus, Save, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { storyhub } from "../api/storyhub";
import {
  Button,
  Card,
  Input,
  SectionTitle,
  Textarea,
  Badge,
  Spinner,
} from "../components/ui";
import type { Art, Chapter } from "../types";
import { mediaUrl } from "../utils/media";
import { MediaImage } from "../components/MediaImage";

const defaultForm = {
  isPublished: "Published",
  title: "",
  status: "Ongoing",
  category: "Novel",
  tagline: "",
  synopsis: "",
};

type PickerProps = {
  title: string;
  values: string[];
  selected: string[];
  setSelected: (v: string[]) => void;
  prefix?: string;
};
function TagPicker({
  title,
  values,
  selected,
  setSelected,
  prefix = "",
}: PickerProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      values
        .filter((v) => v.toLowerCase().includes(query.trim().toLowerCase()))
        .slice(0, 30),
    [values, query],
  );
  const toggle = (v: string) =>
    setSelected(
      selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v],
    );
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-bold">{title}</div>
        <span className="text-[10px] font-semibold text-gray-400">
          {selected.length} dipilih
        </span>
      </div>
      <div className="relative mt-3">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          placeholder={`Cari ${title.toLowerCase()}...`}
        />
      </div>
      {query && (
        <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          {filtered.length ? (
            filtered.map((v) => (
              <button
                key={`result-${v}`}
                type="button"
                onClick={() => toggle(v)}
                className="flex w-full items-center justify-between border-b border-gray-50 px-3 py-2.5 text-left text-xs hover:bg-violet-50"
              >
                <span>
                  {prefix}
                  {v}
                </span>
                <span className="text-primary">
                  {selected.includes(v) ? "✓" : "+"}
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-xs text-gray-400">
              Tidak ada hasil untuk “{query}”.
            </div>
          )}
        </div>
      )}
      <div className="mt-3 flex max-h-48 flex-wrap gap-2 overflow-auto">
        {selected.map((v) => (
          <button
            key={`selected-${v}`}
            type="button"
            onClick={() => toggle(v)}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white"
          >
            {prefix}
            {v}
            <X size={12} />
          </button>
        ))}
        {!selected.length && !query && (
          <span className="text-xs text-gray-400">Belum ada pilihan.</span>
        )}
      </div>
    </Card>
  );
}

function useOptions() {
  const [options, setOptions] = useState<{
    genres: string[];
    tags: string[];
    moods: string[];
  }>({ genres: [], tags: [], moods: [] });
  useEffect(() => {
    Promise.allSettled([
      storyhub.genres(),
      storyhub.tags(),
      storyhub.moods(),
    ]).then(([g, t, m]) =>
      setOptions({
        genres:
          g.status === "fulfilled"
            ? (g.value.data || []).map((x) => x.genre)
            : [],
        tags:
          t.status === "fulfilled"
            ? (t.value.data || []).map((x) => x.tag)
            : [],
        moods:
          m.status === "fulfilled"
            ? (m.value.data || []).map((x) => x.mood)
            : [],
      }),
    );
  }, []);
  return options;
}

export function CreateArtPage() {
  const nav = useNavigate();
  const options = useOptions();
  const [f, setF] = useState(defaultForm);
  const [cover, setCover] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!cover || !banner) {
      alert("Cover dan banner wajib dipilih.");
      return;
    }
    setBusy(true);
    try {
      const d = new FormData();
      Object.entries(f).forEach(([k, v]) => d.set(k, String(v)));
      d.set("cover_img", cover);
      d.set("banner_img", banner);
      genres.forEach((v) => d.append("genres[]", v));
      tags.forEach((v) => d.append("tags[]", v));
      moods.forEach((v) => d.append("moods[]", v));
      const r = await storyhub.createArt(d);
      nav(`/edit/${r.art_id}/chapter/new`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <WriterLayout
      title="Buat Karya"
      subtitle="Buat karya dengan alur field dan endpoint yang sama dengan StoryHub Mobile."
    >
      <div className="space-y-6">
        <Card className="p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Judul
              <Input
                className="mt-2"
                value={f.title}
                onChange={(e) => setF({ ...f, title: e.target.value })}
              />
            </label>
            <label className="text-sm font-semibold">
              Kategori
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3"
                value={f.category}
                onChange={(e) => setF({ ...f, category: e.target.value })}
              >
                {[
                  "Novel",
                  "Book",
                  "Manga",
                  "Manhwa",
                  "Comic",
                  "Game",
                  "Visual Novel",
                  "Story Game",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Status
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3"
                value={f.status}
                onChange={(e) => setF({ ...f, status: e.target.value })}
              >
                {["Ongoing", "Completed", "Hiatus"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Publish
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3"
                value={f.isPublished}
                onChange={(e) => setF({ ...f, isPublished: e.target.value })}
              >
                <option>Published</option>
                <option>Draft</option>
              </select>
            </label>
            <label className="text-sm font-semibold md:col-span-2">
              Tagline
              <Input
                className="mt-2"
                value={f.tagline}
                onChange={(e) => setF({ ...f, tagline: e.target.value })}
              />
            </label>
            <label className="text-sm font-semibold md:col-span-2">
              Synopsis
              <Textarea
                className="mt-2 min-h-[160px]"
                value={f.synopsis}
                onChange={(e) => setF({ ...f, synopsis: e.target.value })}
              />
            </label>
          </div>
        </Card>
        <MediaInput label="Cover (portrait)" file={cover} setFile={setCover} />
        <MediaInput
          label="Banner (landscape)"
          file={banner}
          setFile={setBanner}
        />
        <TagPicker
          title="Genre"
          values={options.genres}
          selected={genres}
          setSelected={setGenres}
        />
        <TagPicker
          title="Tag"
          values={options.tags}
          selected={tags}
          setSelected={setTags}
          prefix="#"
        />
        <TagPicker
          title="Mood"
          values={options.moods}
          selected={moods}
          setSelected={setMoods}
        />
        <div className="flex justify-end">
          <Button disabled={busy} onClick={submit}>
            <Save size={16} />
            {busy ? "Menyimpan…" : "Buat Karya"}
          </Button>
        </div>
      </div>
    </WriterLayout>
  );
}

export function EditArtPage() {
  const { id } = useParams();
  const artId = Number(id);
  const nav = useNavigate();
  const options = useOptions();
  const [art, setArt] = useState<Art | null>(null);
  const [f, setF] = useState(defaultForm);
  const [genres, setGenres] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [cover, setCover] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    Promise.all([
      storyhub.art(artId),
      storyhub.artGenres(artId),
      storyhub.artTags(artId),
      storyhub.artMoods(artId),
      storyhub.chapters(artId, "Draft"),
    ])
      .then(([a, g, t, m, c]) => {
        setArt(a.data);
        setF({
          isPublished: a.data.isPublished || "Draft",
          title: a.data.title || "",
          status: a.data.status || "Ongoing",
          category: a.data.category || "Novel",
          tagline: a.data.tagline || "",
          synopsis: a.data.synopsis || "",
        });
        setGenres((g.data || []).map((x) => x.genre));
        setTags((t.data || []).map((x) => x.tag));
        setMoods((m.data || []).map((x) => x.mood));
        setChapters(c.data || []);
      })
      .catch((e) => alert(e.message));
  }, [artId]);
  if (!art)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  const save = async () => {
    setBusy(true);
    try {
      const d = new FormData();
      Object.entries(f).forEach(([k, v]) => d.set(k, String(v)));
      if (cover) d.set("cover_img", cover);
      if (banner) d.set("banner_img", banner);
      genres.forEach((v) => d.append("genres[]", v));
      tags.forEach((v) => d.append("tags[]", v));
      moods.forEach((v) => d.append("moods[]", v));
      await storyhub.updateArt(artId, d);
      nav(`/art/${artId}`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <WriterLayout
      title={`Edit: ${art.title}`}
      subtitle="Edit metadata, media, tag, genre, mood, dan status terbit."
    >
      <div className="space-y-6">
        <Card className="flex gap-4 p-5">
          <MediaImage
            src={art.cover_img}
            className="h-32 w-24 rounded-xl object-cover"
          />
          <div>
            <h3 className="font-bold">{art.title}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {art.category} · {art.isPublished}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => nav(`/art/${artId}`)}>
                Preview
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  nav(
                    `/edit/${artId}/chapter/${chapters[0]?.chapter_number ?? "new"}`,
                  )
                }
              >
                Kelola Chapter
              </Button>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Judul
              <Input
                className="mt-2"
                value={f.title}
                onChange={(e) => setF({ ...f, title: e.target.value })}
              />
            </label>
            <label className="text-sm font-semibold">
              Kategori
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3"
                value={f.category}
                onChange={(e) => setF({ ...f, category: e.target.value })}
              >
                {[
                  "Novel",
                  "Book",
                  "Manga",
                  "Manhwa",
                  "Comic",
                  "Game",
                  "Visual Novel",
                  "Story Game",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Status
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3"
                value={f.status}
                onChange={(e) => setF({ ...f, status: e.target.value })}
              >
                {["Ongoing", "Completed", "Hiatus"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Publish
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3"
                value={f.isPublished}
                onChange={(e) => setF({ ...f, isPublished: e.target.value })}
              >
                <option>Published</option>
                <option>Draft</option>
              </select>
            </label>
            <label className="text-sm font-semibold md:col-span-2">
              Tagline
              <Input
                className="mt-2"
                value={f.tagline}
                onChange={(e) => setF({ ...f, tagline: e.target.value })}
              />
            </label>
            <label className="text-sm font-semibold md:col-span-2">
              Synopsis
              <Textarea
                className="mt-2 min-h-[150px]"
                value={f.synopsis}
                onChange={(e) => setF({ ...f, synopsis: e.target.value })}
              />
            </label>
          </div>
        </Card>
        <MediaInput
          label="Ganti cover"
          file={cover}
          setFile={setCover}
          preview={mediaUrl(art.cover_img)}
        />
        <MediaInput
          label="Ganti banner"
          file={banner}
          setFile={setBanner}
          preview={mediaUrl(art.banner_img)}
        />
        <TagPicker
          title="Genre"
          values={options.genres}
          selected={genres}
          setSelected={setGenres}
        />
        <TagPicker
          title="Tag"
          values={options.tags}
          selected={tags}
          setSelected={setTags}
          prefix="#"
        />
        <TagPicker
          title="Mood"
          values={options.moods}
          selected={moods}
          setSelected={setMoods}
        />
        <div className="flex justify-between">
          <Button
            variant="danger"
            onClick={async () => {
              if (confirm("Hapus karya ini?")) {
                await storyhub.deleteArt(artId);
                nav("/my-works");
              }
            }}
          >
            <Trash2 size={15} />
            Hapus Karya
          </Button>
          <Button disabled={busy} onClick={save}>
            <Save size={16} />
            {busy ? "Menyimpan…" : "Simpan Perubahan"}
          </Button>
        </div>
      </div>
      {chapters.length > 0 && (
        <Card className="mt-6 p-5">
          <SectionTitle
            title="Draft / Chapter"
            action={
              <Button
                variant="secondary"
                onClick={() => nav(`/edit/${artId}/chapter/new`)}
              >
                <Plus size={15} />
                Chapter Baru
              </Button>
            }
          />
          <div className="space-y-2">
            {chapters.map((c) => (
              <button
                key={c.id}
                onClick={() =>
                  nav(`/edit/${artId}/chapter/${c.chapter_number}`)
                }
                className="flex w-full items-center gap-3 rounded-xl bg-gray-50 p-3 text-left"
              >
                <span className="rounded-lg bg-violet-50 px-2 py-1 text-xs font-bold text-primary">
                  {c.chapter_number}
                </span>
                <span className="font-semibold">{c.title}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {c.isPublished}
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </WriterLayout>
  );
}

export function EditChapterPage() {
  const { id, chapterNumber } = useParams();
  const aid = Number(id);
  const isNew = chapterNumber === "new";
  const num = isNew ? 0 : Number(chapterNumber);
  const nav = useNavigate();
  const [art, setArt] = useState<Art | null>(null);
  const [ch, setCh] = useState<Chapter | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pub, setPub] = useState("Published");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    storyhub.art(aid).then((r) => setArt(r.data));
    if (!isNew) {
      storyhub
        .chapter(aid, num)
        .then((r) => {
          setCh(r.data);
          setTitle(r.data.title);
          setContent(r.data.isi_chapter_novel || "");
          setPub(r.data.isPublished || "Published");
        })
        .catch(async () => {
          try {
            const r = await storyhub.chapters(aid, "Draft");
            const found = r.data.find(
              (x: any) => Number(x.chapter_number) === num,
            );
            if (found) {
              setCh(found);
              setTitle(found.title);
              setContent(found.isi_chapter_novel || "");
              setPub(found.isPublished || "Draft");
            }
          } catch {}
        });
    }
  }, [aid, num, isNew]);
  const save = async () => {
    setBusy(true);
    try {
      if (isNew)
        await storyhub.createChapter(aid, {
          title,
          isi_chapter: content,
          isPublished: pub,
        });
      else
        await storyhub.updateChapter(aid, ch?.id || 0, {
          title,
          isi_chapter: content,
          isPublished: pub,
        });
      nav(`/edit/${aid}`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };
  const del = async () => {
    if (!ch || !confirm("Hapus chapter ini?")) return;
    try {
      await storyhub.deleteChapter(aid, ch.id);
      nav(`/edit/${aid}`);
    } catch (e: any) {
      alert(e.message);
    }
  };
  if (!art)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  return (
    <WriterLayout
      title={isNew ? `Chapter baru · ${art.title}` : `Edit Chapter ${num}`}
      subtitle="Editor chapter terhubung ke endpoint chapter StoryHub."
    >
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{art.title}</Badge>
          {!isNew && <Badge>Chapter {num}</Badge>}
        </div>
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-semibold">
            Judul Chapter
            <Input
              className="mt-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold">
            Status
            <select
              className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3"
              value={pub}
              onChange={(e) => setPub(e.target.value)}
            >
              <option>Published</option>
              <option>Draft</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Isi Chapter
            <Textarea
              className="mt-2 min-h-[480px] font-serif leading-7"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis cerita di sini…"
            />
          </label>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => nav(`/edit/${aid}`)}>
              Batal
            </Button>
            <div className="flex gap-2">
              {!isNew && (
                <Button variant="danger" onClick={del}>
                  <Trash2 size={15} />
                  Hapus
                </Button>
              )}
              <Button disabled={busy} onClick={save}>
                <Save size={15} />
                {busy ? "Menyimpan…" : "Simpan Chapter"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </WriterLayout>
  );
}

function WriterLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: any;
}) {
  return (
    <div className="w-full">
      <SectionTitle title={title} />
      <p className="-mt-3 mb-5 text-sm text-gray-500">{subtitle}</p>
      {children}
    </div>
  );
}
function MediaInput({
  label,
  file,
  setFile,
  preview,
}: {
  label: string;
  file: File | null;
  setFile: (f: File | null) => void;
  preview?: string;
}) {
  const url = file ? URL.createObjectURL(file) : preview;
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-32 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
          {url ? (
            <img src={url} className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="text-gray-400" />
          )}
        </div>
        <label className="cursor-pointer">
          <div className="text-sm font-bold">{label}</div>
          <div className="mt-1 text-xs text-gray-500">JPG/PNG/WebP</div>
          <input
            className="mt-3 block text-sm"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>
    </Card>
  );
}
