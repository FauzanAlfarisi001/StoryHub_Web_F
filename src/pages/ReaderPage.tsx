import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { storyhub } from "../api/storyhub";
import type { Art, Chapter, ChapterPage, Comment, Review } from "../types";
import {
  Button,
  Card,
  EmptyState,
  Textarea,
  Badge,
  Spinner,
} from "../components/ui";
import { isComic } from "../utils/media";
import { UserAvatar } from "../components/UserAvatar";
import { useAuth } from "../context/AuthContext";
import { LikeButton } from "../components/LikeButton";
import { MediaImage } from "../components/MediaImage";
import { StarRating } from "../components/StarRating";

export default function ReaderPage() {
  const { artId, chapterNumber } = useParams();
  const aid = Number(artId),
    num = Number(chapterNumber);
  const { user } = useAuth();
  const nav = useNavigate();
  const [art, setArt] = useState<Art | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [pages, setPages] = useState<ChapterPage[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [font, setFont] = useState(18);
  const [tab, setTab] = useState<"review" | "comment">("review");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const artResp = await storyhub.art(aid);
      const artData = artResp.data;
      setArt(artData);
      const chapterList = (await storyhub.chapters(aid)).data || [];
      setChapters(chapterList);
      const current = chapterList.find((c) => Number(c.chapter_number) === num);
      if (isComic(artData.category)) {
        setPages((await storyhub.comicChapter(aid, num)).data || []);
        setChapter(
          current ||
            ({
              id: 0,
              art_id: aid,
              chapter_number: num,
              title: `Chapter ${num}`,
            } as Chapter),
        );
      } else {
        setChapter((await storyhub.chapter(aid, num)).data);
      }
      const chapterId = current?.id || 0;
      if (chapterId) {
        const [reviewResult, commentResult] = await Promise.allSettled([
          storyhub.reviews("chapters", chapterId),
          storyhub.comments("chapters", chapterId),
        ]);
        if (reviewResult.status === "fulfilled")
          setReviews(reviewResult.value.data || []);
        else setReviews([]);
        if (commentResult.status === "fulfilled")
          setComments(commentResult.value.data || []);
        else setComments([]);
        if (user)
          storyhub
            .postHistory(aid, chapterId, { page_number: 1, scroll_position: 0 })
            .catch(() => {});
      }
    } catch (e: any) {
      setError(e.message || "Tidak dapat membuka chapter.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [aid, num, user?.id]);
  const idx = chapters.findIndex((c) => Number(c.chapter_number) === num);
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;
  const comic = isComic(art?.category || "");
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <Spinner />
      </div>
    );
  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 p-6">
        <Card className="max-w-md p-6 text-center">
          <div className="text-lg font-bold">Chapter tidak dapat dibuka</div>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <Button
            className="mt-4"
            onClick={() => nav(`/art/${aid}?tab=chapters`)}
          >
            Kembali ke Detail
          </Button>
        </Card>
      </div>
    );
  const chapterId = chapter?.id || 0;
  const submitReview = async () => {
    if (!user) {
      nav("/login");
      return;
    }
    if (rating === 0) {
      alert("Pilih rating terlebih dahulu.");
      return;
    }
    try {
      await storyhub.addReview("chapters", chapterId, rating, reviewText);
      setReviewText("");
      setRating(0);
      setReviews((await storyhub.reviews("chapters", chapterId)).data || []);
    } catch (e: any) {
      alert(e.message);
    }
  };
  const submitComment = async () => {
    if (!user) {
      nav("/login");
      return;
    }
    if (!reviewText.trim()) return;
    try {
      await storyhub.addComment("chapters", chapterId, reviewText);
      setReviewText("");
      setComments((await storyhub.comments("chapters", chapterId)).data || []);
    } catch (e: any) {
      alert(e.message);
    }
  };
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollBottom = () =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111111]/95 backdrop-blur">
        <div className="mx-auto flex w-full items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <button
            onClick={() => nav(`/art/${aid}?tab=chapters`)}
            className="rounded-xl p-2 text-gray-300 hover:bg-white/10"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{art?.title}</div>
            <div className="text-xs text-gray-400">
              Chapter {num} · {chapter?.title}
            </div>
          </div>
          {!comic && (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                onClick={() => setFont((v) => Math.max(13, v - 1))}
                className="rounded-lg p-2 hover:bg-white/10"
                aria-label="Kecilkan font"
              >
                −
              </button>
              <span className="w-7 text-center text-xs text-gray-400">Aa</span>
              <button
                onClick={() => setFont((v) => Math.min(28, v + 1))}
                className="rounded-lg p-2 hover:bg-white/10"
                aria-label="Besarkan font"
              >
                +
              </button>
            </div>
          )}
          <button
            onClick={() => prev && nav(`/read/${aid}/${prev.chapter_number}`)}
            disabled={!prev}
            className="rounded-xl p-2 hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft size={25} />
          </button>
          <button
            onClick={() => next && nav(`/read/${aid}/${next.chapter_number}`)}
            disabled={!next}
            className="rounded-xl p-2 hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronRight size={25} />
          </button>
        </div>
      </header>
      <div className="fixed right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2">
        <button
          onClick={scrollTop}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white shadow-xl backdrop-blur hover:bg-black/90"
          aria-label="Ke atas"
        >
          <ChevronUp size={30} />
        </button>
        <button
          onClick={scrollBottom}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white shadow-xl backdrop-blur hover:bg-black/90"
          aria-label="Ke bawah"
        >
          <ChevronDown size={30} />
        </button>
      </div>
      <div className="fixed bottom-4 right-4 z-30 flex gap-2 lg:hidden">
        <button
          onClick={scrollTop}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/75 text-white shadow-xl backdrop-blur"
          aria-label="Ke atas"
        >
          <ChevronUp size={18} />
        </button>
        <button
          onClick={scrollBottom}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/75 text-white shadow-xl backdrop-blur"
          aria-label="Ke bawah"
        >
          <ChevronDown size={18} />
        </button>
      </div>
      <main className="mx-auto w-full px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
        <div className="mx-auto max-w-5xl">
          {comic ? (
            <div className="space-y-2">
              {pages.map((p) => (
                <MediaImage
                  key={p.id}
                  src={p.img_chapter_comic}
                  alt={`Page ${p.page_number}`}
                  className="mx-auto block w-full max-w-4xl"
                />
              ))}
            </div>
          ) : (
            <article className="mx-auto max-w-2xl">
              <div className="mb-8 text-center">
                <Badge className="bg-white/10 text-white">Chapter {num}</Badge>
                <h1 className="mt-3 text-2xl font-black">{chapter?.title}</h1>
              </div>
              <div
                className="whitespace-pre-wrap text-gray-200"
                style={{ fontSize: font, lineHeight: 1.9 }}
              >
                {chapter?.isi_chapter_novel}
              </div>
            </article>
          )}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <Button
              variant="ghost"
              onClick={() => prev && nav(`/read/${aid}/${prev.chapter_number}`)}
              disabled={!prev}
              className="text-white hover:bg-white/10"
            >
              ← Sebelumnya
            </Button>
            <Button onClick={() => nav(`/art/${aid}?tab=chapters`)}>
              Daftar Chapter
            </Button>
            <Button
              variant="ghost"
              onClick={() => next && nav(`/read/${aid}/${next.chapter_number}`)}
              disabled={!next}
              className="text-white hover:bg-white/10"
            >
              Berikutnya →
            </Button>
          </div>
          <section className="mt-12 rounded-3xl bg-white p-5 text-gray-900 sm:p-6">
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setTab("review")}
                className={`border-b-2 px-3 py-3 text-sm font-bold ${tab === "review" ? "border-primary text-primary" : "border-transparent text-gray-500"}`}
              >
                Reviews ({reviews.length})
              </button>
              <button
                onClick={() => setTab("comment")}
                className={`border-b-2 px-3 py-3 text-sm font-bold ${tab === "comment" ? "border-primary text-primary" : "border-transparent text-gray-500"}`}
              >
                Comments ({comments.length})
              </button>
            </div>
            {tab === "review" ? (
              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
                <div className="space-y-3">
                  {reviews.length ? (
                    reviews.map((r) => (
                      <Card key={r.id} className="p-3">
                        <div className="flex gap-3">
                          <UserAvatar
                            user={{
                              username: r.username,
                              profile_img: r.profile_img,
                            }}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold">
                              @{r.username}{" "}
                              <span className="ml-2 text-amber-500">
                                ★ {r.rating}/10
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              {r.komentar}
                            </p>
                            <div className="mt-2">
                              <LikeButton
                                parent="chapters"
                                parentId={chapterId}
                                targetType="reviews"
                                targetId={r.id}
                                count={r.total_likes}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <EmptyState title="Belum ada review" />
                  )}
                </div>
                <Card className="p-4">
                  {user ? (
                    <>
                      <div className="font-bold">Nilai chapter</div>
                      <div className="mt-3">
                        <StarRating
                          value={rating}
                          onChange={setRating}
                          max={10}
                          size={17}
                        />
                      </div>
                      <Textarea
                        className="mt-3 min-h-[100px]"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Komentar review"
                      />
                      <Button onClick={submitReview} className="mt-2 w-full">
                        Kirim
                      </Button>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Login untuk review.
                    </div>
                  )}
                </Card>
              </div>
            ) : (
              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
                <div className="space-y-3">
                  {comments.length ? (
                    comments.map((c) => (
                      <Card key={c.id} className="p-3">
                        <div className="flex gap-3">
                          <UserAvatar
                            user={{
                              username: c.username,
                              profile_img: c.profile_img,
                            }}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold">
                              @{c.username}
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                              {c.komentar}
                            </div>
                            <div className="mt-2">
                              <LikeButton
                                parent="chapters"
                                parentId={chapterId}
                                targetType="comments"
                                targetId={c.id}
                                count={c.total_likes}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <EmptyState title="Belum ada komentar" />
                  )}
                </div>
                <Card className="p-4">
                  {user ? (
                    <>
                      <div className="font-bold">Komentar</div>
                      <Textarea
                        className="mt-3 min-h-[100px]"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Tulis komentar"
                      />
                      <Button onClick={submitComment} className="mt-2 w-full">
                        Kirim
                      </Button>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Login untuk berkomentar.
                    </div>
                  )}
                </Card>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
