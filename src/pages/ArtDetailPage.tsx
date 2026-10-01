import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Play,
  MessageSquare,
  Share2,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { storyhub } from "../api/storyhub";
import type { Art, Chapter, Comment, Review } from "../types";
import { ChapterRowDetail } from "../components/ChapterRowDetail";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Spinner,
  Textarea,
} from "../components/ui";
import { UserAvatar } from "../components/UserAvatar";
import { LikeButton } from "../components/LikeButton";
import { MediaImage } from "../components/MediaImage";
import { formatDate, isGame, mediaUrl } from "../utils/media";
import { useAuth } from "../context/AuthContext";
import { StarRating } from "../components/StarRating";

export default function ArtDetailPage() {
  const { id } = useParams();
  const artId = Number(id);
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [art, setArt] = useState<Art | null>(null);
  const [tab, setTab] = useState<
    "overview" | "chapters" | "reviews" | "comments"
  >((searchParams.get("tab") as any) || "overview");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const a = await storyhub.art(artId);
      const game = isGame(a.data.category);
      const [g, t, m, c, r, commentsResult] = await Promise.allSettled([
        storyhub.artGenres(artId),
        storyhub.artTags(artId),
        storyhub.artMoods(artId),
        game
          ? Promise.resolve({ data: [] as Chapter[] })
          : storyhub.chapters(artId),
        storyhub.reviews("arts", artId),
        storyhub.comments("arts", artId),
      ]);
      const genresData = g.status === "fulfilled" ? g.value.data || [] : [];
      const tagsData = t.status === "fulfilled" ? t.value.data || [] : [];
      const moodsData = m.status === "fulfilled" ? m.value.data || [] : [];
      const chaptersData = c.status === "fulfilled" ? c.value.data || [] : [];
      const reviewsData = r.status === "fulfilled" ? r.value.data || [] : [];
      const commentsData =
        commentsResult.status === "fulfilled"
          ? commentsResult.value.data || []
          : [];
      setArt({
        ...a.data,
        __genres: genresData.map((x) => x.genre),
        __tags: tagsData.map((x) => x.tag),
        __moods: moodsData.map((x) => x.mood),
      } as any);
      setChapters(chaptersData);
      setReviews(reviewsData);
      setComments(commentsData);
      if (user) {
        setReviewed(
          reviewsData.some(
            (item: any) =>
              String(item.username || "").toLowerCase() ===
              String(user.username || "").toLowerCase(),
          ),
        );
        try {
          const b = await storyhub.bookmarks();
          setBookmarked((b.data || []).some((x) => x.id === artId));
        } catch {
          setBookmarked(false);
        }
        try {
          setHistory((await storyhub.readingHistory(artId)).data);
        } catch {
          setHistory(null);
        }
      } else {
        setBookmarked(false);
        setHistory(null);
        setReviewed(false);
      }
    } catch (e: any) {
      setError(e.message || "Tidak dapat memuat detail karya.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (artId) load();
  }, [artId, user?.id]);
  useEffect(() => {
    const requested = searchParams.get("tab");
    if (
      requested === "overview" ||
      requested === "chapters" ||
      requested === "reviews" ||
      requested === "comments"
    )
      setTab(requested);
  }, [searchParams]);
  const genres = (art as any)?.__genres || [],
    tags = (art as any)?.__tags || [],
    moods = (art as any)?.__moods || [];
  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  if (error || !art)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md p-6 text-center">
          <div className="font-bold">Karya tidak dapat dimuat</div>
          <p className="mt-2 text-sm text-gray-500">
            {error || "Data karya tidak ditemukan."}
          </p>
          <Button className="mt-4" onClick={() => nav("/")}>
            Kembali ke Home
          </Button>
        </Card>
      </div>
    );
  const game = isGame(art.category);
  const continueChapter = history?.latest_chapter_id
    ? chapters.find((c) => Number(c.id) === Number(history.latest_chapter_id))
    : chapters[0];
  const toggleBookmark = async () => {
    if (!user) {
      nav("/login");
      return;
    }
    setBusy(true);
    try {
      if (bookmarked) {
        await storyhub.removeBookmarkArt(artId);
        setBookmarked(false);
      } else {
        await storyhub.addBookmarkArt(artId);
        setBookmarked(true);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };
  const openGame = () => {
    if (!art.play_url) {
      alert("Link game belum tersedia.");
      return;
    }
    window.open(art.play_url, "_blank", "noopener,noreferrer");
  };
  const submitReview = async () => {
    if (!user) {
      nav("/login");
      return;
    }
    if (reviewRating === 0) {
      alert("Pilih rating bintang terlebih dahulu.");
      return;
    }
    setBusy(true);
    try {
      await storyhub.addReview("arts", artId, reviewRating, reviewText);
      setReviewText("");
      setReviewed(true);
      const r = await storyhub.reviews("arts", artId);
      setReviews(r.data || []);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };
  const submitComment = async () => {
    if (!user) {
      nav("/login");
      return;
    }
    if (!comment.trim()) return;
    setBusy(true);
    try {
      await storyhub.addComment("arts", artId, comment);
      setComment("");
      setComments((await storyhub.comments("arts", artId)).data || []);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="-mx-4 -mt-5 sm:-mx-6 lg:-mx-8">
      <section className="relative min-h-[390px] overflow-hidden">
        <MediaImage
          src={art.banner_img || art.cover_img}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/20" />
        <div className="relative mx-auto flex min-h-[390px] max-w-[1500px] items-end px-4 pb-6 pt-6 sm:px-6 lg:px-8">
          <button
            onClick={() => nav(-1)}
            className="absolute left-4 top-4 rounded-full bg-black/40 p-2 text-white backdrop-blur sm:left-6 lg:left-8"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={toggleBookmark}
            disabled={busy}
            className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white backdrop-blur sm:right-6 lg:right-8"
          >
            {bookmarked ? (
              <BookmarkCheck
                size={30}
                className="text-[#8b5cf6]"
                fill="currentColor"
              />
            ) : (
              <Bookmark size={30} />
            )}
          </button>
          <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-end">
            <MediaImage
              src={art.cover_img}
              className="h-36 w-24 rounded-2xl object-cover shadow-2xl sm:h-48 sm:w-32"
            />
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-white/10 text-white">{art.category}</Badge>
                {art.status && (
                  <Badge className="bg-white/10 text-white">{art.status}</Badge>
                )}
              </div>
              <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                {art.title}
              </h1>
              <p className="mt-2 text-sm text-gray-200">{art.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-white">
                <span className="flex items-center gap-1 text-amber-300">
                  <Star size={15} fill="currentColor" />{" "}
                  {Number(art.rata2_rating || 0).toFixed(1)}
                </span>
                <span className="flex items-center gap-1 text-primary/90">
                  <Users size={15} /> {art.total_reviews || 0} Reviews
                </span>
                {!game && (
                  <span className="flex items-center gap-1 text-primary/90">
                    <BookOpen size={15} />{" "}
                    {art.jumlah_chapter || chapters.length || 0} Chapters
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  onClick={
                    game
                      ? openGame
                      : () =>
                          continueChapter &&
                          nav(
                            `/read/${art.id}/${continueChapter.chapter_number}`,
                          )
                  }
                >
                  <Play size={16} fill="currentColor" />
                  {game
                    ? "Play Now"
                    : history
                      ? "Lanjutkan membaca"
                      : "Mulai membaca"}
                </Button>
                {art.authorOrDev && (
                  <button
                    onClick={() =>
                      nav(`https://www.google.com/search?q=/${art.authorOrDev}`)
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
                  >
                    <UserRound size={16} />
                    {art.authorOrDev}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto border-b border-gray-200">
          <Tab active={tab === "overview"} onClick={() => setTab("overview")}>
            Overview
          </Tab>
          {!game && (
            <Tab active={tab === "chapters"} onClick={() => setTab("chapters")}>
              Chapters
            </Tab>
          )}
          <Tab active={tab === "reviews"} onClick={() => setTab("reviews")}>
            Reviews ({reviews.length})
          </Tab>
          <Tab active={tab === "comments"} onClick={() => setTab("comments")}>
            Comments ({comments.length})
          </Tab>
        </div>
        {tab === "overview" && (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="space-y-5">
              <Card className="p-5">
                <h2 className="text-lg font-bold">Synopsis</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                  {art.synopsis || "Belum ada synopsis."}
                </p>
              </Card>
              {game && (
                <Card className="p-5">
                  <h2 className="text-lg font-bold">Screenshots</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[art.ss1_img, art.ss2_img, art.ss3_img]
                      .filter(Boolean)
                      .map((src, i) => (
                        <MediaImage
                          key={`${src}-${i}`}
                          src={src}
                          alt={`${art.title} screenshot ${i + 1}`}
                          className="aspect-video w-full rounded-xl object-cover bg-gray-100"
                        />
                      ))}
                    {![art.ss1_img, art.ss2_img, art.ss3_img].some(Boolean) && (
                      <p className="text-sm text-gray-500">
                        Belum ada screenshot.
                      </p>
                    )}
                  </div>
                </Card>
              )}
              <Card className="p-5">
                <h2 className="text-lg font-bold">Tags & Mood</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {genres.map((x: string) => (
                    <button
                      key={x}
                      onClick={() =>
                        nav(`/discover?genre=${encodeURIComponent(x)}`)
                      }
                      className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-primary"
                    >
                      {x}
                    </button>
                  ))}
                  {tags.map((x: string) => (
                    <button
                      key={x}
                      onClick={() =>
                        nav(`/discover?tag=${encodeURIComponent(x)}`)
                      }
                      className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700"
                    >
                      #{x}
                    </button>
                  ))}
                  {moods.map((x: string) => (
                    <button
                      key={x}
                      onClick={() =>
                        nav(`/discover?mood=${encodeURIComponent(x)}`)
                      }
                      className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600"
                    >
                      {x}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
            <Card className="h-fit p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Details
              </div>
              <dl className="mt-4 space-y-4 text-sm">
                <Info label="Author / Dev" value={art.authorOrDev || "-"} />
                <Info label="Artist" value={art.artist || "-"} />
                <Info label="Status" value={art.status || "-"} />
                <Info label="Published" value={formatDate(art.published_at)} />
                <Info
                  label="Rating chapter"
                  value={`${Number(art.rata2_rating_ch || 0).toFixed(1)} (${art.total_reviews_ch || 0})`}
                />
              </dl>
            </Card>
          </div>
        )}
        {tab === "chapters" && (
          <div className="mt-6 space-y-3">
            {chapters.length ? (
              chapters.map((c) => <ChapterRowDetail key={c.id} chapter={c} />)
            ) : (
              <EmptyState
                title="Belum ada chapter"
                text="Karya ini belum mempunyai chapter terbit."
              />
            )}
          </div>
        )}
        {tab === "reviews" && (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {reviews.length ? (
                reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} artId={artId} />
                ))
              ) : (
                <EmptyState
                  title="Belum ada review"
                  text="Jadilah yang pertama memberi penilaian."
                />
              )}
            </div>
            <Card className="h-fit p-5">
              {user ? (
                <>
                  {reviewed ? (
                    <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                      Kamu sudah memberikan review untuk karya ini.
                    </div>
                  ) : (
                    <>
                      <h3 className="font-bold">Nilai karya</h3>
                      <div className="mt-4 flex items-center gap-2">
                        <StarRating
                          value={reviewRating}
                          onChange={setReviewRating}
                          size={17}
                        />
                      </div>
                      <Textarea
                        className="mt-4 min-h-[120px]"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Tulis pendapatmu…"
                      />
                      <Button
                        onClick={submitReview}
                        disabled={busy}
                        className="mt-3 w-full"
                      >
                        Kirim Review
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-500">
                  Login untuk memberikan review.
                </div>
              )}
            </Card>
          </div>
        )}
        {tab === "comments" && (
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {comments.length ? (
                comments.map((c) => (
                  <CommentCard key={c.id} comment={c} artId={artId} />
                ))
              ) : (
                <EmptyState
                  title="Belum ada komentar"
                  text="Mulai percakapan tentang karya ini."
                />
              )}
            </div>
            <Card className="h-fit p-5">
              {user ? (
                <>
                  <h3 className="font-bold">Tulis komentar</h3>
                  <Textarea
                    className="mt-3 min-h-[140px]"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Komentar…"
                  />
                  <Button
                    onClick={submitComment}
                    disabled={busy}
                    className="mt-3 w-full"
                  >
                    Kirim Komentar
                  </Button>
                </>
              ) : (
                <div className="text-sm text-gray-500">
                  Login untuk ikut berdiskusi.
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
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
      className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold ${active ? "border-primary text-primary" : "border-transparent text-gray-500"}`}
    >
      {children}
    </button>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-right font-semibold text-gray-700">{value}</dd>
    </div>
  );
}

function ReviewCard({ review, artId }: { review: Review; artId: number }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadReplies = async () => {
    setLoadingReplies(true);
    try {
      const res = await storyhub.comments("reviews", review.id);
      setReplies(res.data || []);
    } catch {
      setReplies([]);
    } finally {
      setLoadingReplies(false);
    }
  };

  const toggleReplies = () => {
    if (!showReplies) {
      setShowReplies(true);
      loadReplies();
    } else setShowReplies(false);
  };

  const submitReply = async () => {
    if (!user) {
      nav("/login");
      return;
    }
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await storyhub.addComment("reviews", review.id, replyText);
      setReplyText("");
      loadReplies();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <UserAvatar
          user={{ username: review.username, profile_img: review.profile_img }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="font-bold">@{review.username}</div>
            <div className="flex items-center gap-1 text-sm text-amber-500">
              <Star size={13} fill="currentColor" />
              {review.rating}/10
            </div>
          </div>
          <div className="mt-2 text-sm leading-6 text-gray-600">
            {review.komentar || "Tidak menuliskan komentar."}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span>{formatDate(review.created)}</span>
            <LikeButton
              parent="arts"
              parentId={artId}
              targetType="reviews"
              targetId={review.id}
              count={review.total_likes}
            />
            <button
              onClick={toggleReplies}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <MessageSquare size={13} />
              {review.total_balasan} balasan
            </button>
          </div>

          {showReplies && (
            <div className="mt-3 border-l-2 border-gray-100 pl-3 space-y-2">
              {user ? (
                <div className="flex gap-2">
                  <Textarea
                    className="min-h-[60px] text-sm flex-1"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Tulis balasan..."
                  />
                  <Button
                    onClick={submitReply}
                    disabled={submitting}
                    className="self-end text-xs px-3 py-2"
                  >
                    Kirim
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Login untuk membalas.</p>
              )}

              {loadingReplies ? (
                <div className="py-2 flex justify-center">
                  <Spinner />
                </div>
              ) : (
                replies.map((c) => (
                  <CommentCard key={c.id} comment={c} artId={artId} depth={1} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function CommentCard({
  comment,
  artId,
  depth = 0,
}: {
  comment: Comment;
  artId: number;
  depth?: number;
}) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadReplies = async () => {
    setLoadingReplies(true);
    try {
      const res = await storyhub.comments("comments", comment.id);
      setReplies(res.data || []);
    } catch {
      setReplies([]);
    } finally {
      setLoadingReplies(false);
    }
  };

  const toggleReplies = () => {
    if (!showReplies) {
      setShowReplies(true);
      loadReplies();
    } else setShowReplies(false);
  };

  const submitReply = async () => {
    if (!user) {
      nav("/login");
      return;
    }
    if (!replyText.trim()) return;
    setSubmitting(true);
    const targetId =
      comment.depth >= 7 && comment.parent_comment_id
        ? comment.parent_comment_id
        : comment.id;
    try {
      await storyhub.addComment("comments", targetId, replyText);
      setReplyText("");
      loadReplies();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={depth > 0 ? "border-l-2 border-gray-100 pl-3" : ""}>
      <Card className="p-4">
        <div className="flex gap-3">
          <UserAvatar
            user={{
              username: comment.username,
              profile_img: comment.profile_img,
            }}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">@{comment.username}</div>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              {comment.komentar}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <span>{formatDate(comment.created)}</span>
              <LikeButton
                parent="arts"
                parentId={artId}
                targetType="comments"
                targetId={comment.id}
                count={comment.total_likes}
              />
              <button
                onClick={toggleReplies}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <MessageSquare size={13} />
                {comment.total_balasan} balasan
              </button>
            </div>

            {showReplies && (
              <div className="mt-3 space-y-2">
                {user ? (
                  <div className="flex gap-2">
                    <Textarea
                      className="min-h-[60px] text-sm flex-1"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Tulis balasan..."
                    />
                    <Button
                      onClick={submitReply}
                      disabled={submitting}
                      className="self-end text-xs px-3 py-2"
                    >
                      Kirim
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Login untuk membalas.</p>
                )}

                {loadingReplies ? (
                  <div className="py-2 flex justify-center">
                    <Spinner />
                  </div>
                ) : (
                  replies.map((c) => (
                    <CommentCard
                      key={c.id}
                      comment={c}
                      artId={artId}
                      depth={depth + 1}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
