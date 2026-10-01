import { api, apiMultipart, tokenStore } from "./client";
import type {
  Art,
  Chapter,
  ChapterPage,
  Comment,
  Review,
  User,
} from "../types";

export { tokenStore } from "./client";

const qs = (
  params: Record<string, string | number | undefined | null | string[]>,
) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    p.set(k, Array.isArray(v) ? v.join(",") : String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const storyhub = {
  login: (email: string, password: string) =>
    api<{ access_token: string; refresh_token: string; user: User }>("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  register: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) =>
    api<{ message: string }>("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  verify: () => api<{ valid: boolean; user: User }>("/verify"),
  profile: () => api<{ user: User }>("/users/profile"),
  updateProfile: (form: FormData) =>
    apiMultipart<{ user: User }>("/users/profile", form, "PUT"),

  arts: (
    params: Record<string, string | number | undefined | null | string[]>,
  ) => api<{ data: Art[]; meta: any }>(`/arts${qs(params)}`),
  art: (id: number) => api<{ data: Art }>(`/arts/${id}`),
  artGenres: (id: number) =>
    api<{ data: { genre: string }[] }>(`/arts/${id}/genres`),
  artTags: (id: number) => api<{ data: { tag: string }[] }>(`/arts/${id}/tags`),
  artMoods: (id: number) =>
    api<{ data: { mood: string }[] }>(`/arts/${id}/moods`),
  genres: () => api<{ data: { id: number; genre: string }[] }>("/genre"),
  tags: () => api<{ data: { id: number; tag: string }[] }>("/tag"),
  moods: () => api<{ data: { id: number; mood: string }[] }>("/mood"),
  continueReading: async (username?: string) => {
    const response = await api<{ data: any[] }>(
      `/arts/continue_reading${qs({ usernameUserLain: username })}`,
    );
    const data = (response.data || []).map((item: any) => ({
      ...item,
      id: Number(item.id ?? item.art_id ?? item.artId ?? 0),
      latest_chapter_id:
        Number(
          item.latest_chapter_id ??
            item.latestChapterId ??
            item.chapter_id ??
            0,
        ) || undefined,
      progress_percent: Number(
        item.progress_percent ?? item.progressPercent ?? item.progress ?? 0,
      ),
      cover_img: item.cover_img ?? item.coverImg ?? null,
      category: item.category ?? "",
      title: item.title ?? item.art_title ?? "",
    })) as Art[];
    return { ...response, data };
  },
  bookmarks: (category?: string) =>
    api<{ data: Art[] }>(`/bookmark${qs({ category })}`),
  addBookmarkArt: (id: number) =>
    api(`/arts/${id}/bookmark`, { method: "POST" }),
  removeBookmarkArt: (id: number) =>
    api(`/arts/${id}/bookmark`, { method: "DELETE" }),
  addBookmarkChapter: (id: number) =>
    api(`/chapters/${id}/bookmark`, { method: "POST" }),
  removeBookmarkChapter: (id: number) =>
    api(`/chapters/${id}/bookmark`, { method: "DELETE" }),

  chapters: (artId: number, published = "Published") =>
    api<{ data: Chapter[] }>(
      `/arts/${artId}/chapters${qs({ isPublished: published })}`,
    ),
  chapter: (artId: number, number: number) =>
    api<{ data: Chapter }>(`/novel/${artId}/chapter/${number}`),
  comicChapter: (artId: number, number: number) =>
    api<{ data: ChapterPage[] }>(`/comic/${artId}/chapter/${number}`),
  chapterPages: (artId: number, chapterId: number) =>
    api<{ data: ChapterPage[] }>(`/arts/${artId}/chapters/${chapterId}/pages`),
  chapterList: (params: Record<string, any>) =>
    api<{ data: Chapter[]; meta: any }>(`/chapters${qs(params)}`),
  readingHistory: (artId: number) =>
    api<{ data: any }>(`/arts/${artId}/reading_history`),
  postHistory: (
    artId: number,
    chapterId: number,
    data: { page_number?: number; scroll_position?: number },
  ) =>
    api(`/arts/${artId}/chapters/${chapterId}/reading_history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  myArts: (published?: "published" | "draft") =>
    api<{ data: Art[] }>(`/arts/myarts${qs({ ispublished: published })}`),
  userArts: (
    username?: string,
    published: "published" | "draft" = "published",
  ) =>
    api<{ data: Art[] }>(
      `/arts/myarts${qs({ ispublished: published, usernameUserLain: username })}`,
    ),
  createArt: (form: FormData) =>
    apiMultipart<{ art_id: number; message: string }>("/arts", form, "POST"),
  updateArt: (id: number, form: FormData) =>
    apiMultipart<{ art_id: number; message: string }>(
      `/arts/${id}`,
      form,
      "PUT",
    ),
  deleteArt: (id: number) => api(`/arts/${id}`, { method: "DELETE" }),
  createChapter: (
    artId: number,
    data: { title: string; isi_chapter: string; isPublished: string },
  ) =>
    api(`/arts/${artId}/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  updateChapter: (
    artId: number,
    chapterId: number,
    data: { title: string; isi_chapter: string; isPublished: string },
  ) =>
    api(`/arts/${artId}/chapters/${chapterId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  deleteChapter: (artId: number, chapterId: number) =>
    api(`/arts/${artId}/chapters/${chapterId}`, { method: "DELETE" }),

  userSearch: (q: string) => api<{ data: User[] }>(`/users/search${qs({ q })}`),
  user: (username: string) =>
    api<{ user: User }>(`/users/${encodeURIComponent(username)}`),
  followers: (id: number) => api<{ data: User[] }>(`/users/${id}/followers`),
  following: (id: number) => api<{ data: User[] }>(`/users/${id}/following`),
  follow: (id: number) => api(`/users/${id}/follow`, { method: "POST" }),
  unfollow: (id: number) => api(`/users/${id}/follow`, { method: "DELETE" }),
  followStatus: (id: number) =>
    api<{ isFollowing: boolean; isFollower: boolean }>(`/users/${id}/isfollow`),
  followerCount: (id: number) =>
    api<{ total_follower: number }>(`/users/${id}/followers/count`),
  followingCount: (id: number) =>
    api<{ total_following: number }>(`/users/${id}/following/count`),
  reviews: (type: "arts" | "chapters", id: number) =>
    api<{ data: Review[]; total_reviews: number }>(
      `/interaksi/${type}/${id}/reviews`,
    ),
  addReview: (
    type: "arts" | "chapters",
    id: number,
    rating: number,
    komentar: string,
  ) =>
    api(`/interaksi/${type}/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, komentar }),
    }),
  updateReview: (
    type: "arts" | "chapters",
    id: number,
    reviewId: number,
    rating: number,
    komentar: string,
  ) =>
    api(`/interaksi/${type}/${id}/reviews/${reviewId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, komentar }),
    }),
  deleteReview: (type: "arts" | "chapters", id: number, reviewId: number) =>
    api(`/interaksi/${type}/${id}/reviews/${reviewId}`, { method: "DELETE" }),
  reviewStatus: (type: "arts" | "chapters", id: number) =>
    api<{ isSudahReview: boolean }>(`/interaksi/${type}/${id}/is-reviewed`),
  comments: (type: "arts" | "chapters" | "reviews" | "comments", id: number) =>
    api<{ data: Comment[]; total_comments: any }>(
      `/interaksi/${type}/${id}/comments`,
    ).catch((e) => ({ data: [], total_comments: 0, message: e.message })),
  addComment: (
    type: "arts" | "chapters" | "reviews" | "comments",
    id: number,
    komentar: string,
  ) =>
    api(`/interaksi/${type}/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ komentar }),
    }),
  deleteComment: (
    type: "arts" | "chapters" | "reviews" | "comments",
    id: number,
    commentId: number,
  ) =>
    api(`/interaksi/${type}/${id}/comments/${commentId}`, { method: "DELETE" }),
  like: (
    parent: "arts" | "chapters",
    parentId: number,
    targetType: "reviews" | "comments",
    targetId: number,
  ) =>
    api(`/interaksi/${parent}/${parentId}/${targetType}/${targetId}`, {
      method: "POST",
    }),
  unlike: (
    parent: "arts" | "chapters",
    parentId: number,
    targetType: "reviews" | "comments",
    targetId: number,
  ) =>
    api(`/interaksi/${parent}/${parentId}/${targetType}/${targetId}`, {
      method: "DELETE",
    }),
  isLiked: (
    parent: "arts" | "chapters",
    parentId: number,
    targetType: "reviews" | "comments",
    targetId: number,
  ) =>
    api<{ isLiked: boolean }>(
      `/interaksi/${parent}/${parentId}/${targetType}/${targetId}/is-liked`,
    ),

  logout: async () => {
    const refresh = tokenStore.refresh;
    try {
      if (tokenStore.access)
        await api("/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refresh }),
        });
    } finally {
      tokenStore.clear();
    }
  },
};
