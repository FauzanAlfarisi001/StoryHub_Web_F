export type User = {
  id: number;
  username: string;
  name: string;
  email?: string;
  role?: string;
  bio?: string;
  profile_img?: string | null;
};

export type Art = {
  id: number;
  title: string;
  nametag?: string;
  category: string;
  status?: string;
  synopsis?: string;
  tagline?: string;
  isPublished?: string;
  cover_img?: string | null;
  banner_img?: string | null;
  authorOrDev?: string;
  authorOrDev_id?: number;
  artist?: string | null;
  published_at?: string;
  play_url?: string | null;
  jumlah_chapter?: number | null;
  ss1_img?: string | null;
  ss2_img?: string | null;
  ss3_img?: string | null;
  rata2_rating?: number;
  total_reviews?: number;
  rata2_rating_ch?: number;
  total_reviews_ch?: number;
  rata2_rating_user?: number;
  total_reviews_user?: number;
  rata2_rating_user_ch?: number;
  total_reviews_user_ch?: number;
  progress_percent?: number;
  latest_chapter_id?: number;
  rh_art_id?: number;
  genre?: string;
  genre_id?: number;
};

export type Chapter = {
  id: number;
  title: string;
  chapter_number: number;
  art_id: number;
  published_at?: string;
  isPublished?: string;
  isi_chapter_novel?: string;
  chapter_title?: string;
  art_title: string;
  cover_img: string | null;
  rata2_rating_ch?: number;
  total_reviews_ch?: number;
};

export type ChapterPage = {
  id: number;
  chapter_id: number;
  page_number: number;
  img_chapter_comic: string;
};

export type Review = {
  id: number;
  username: string;
  profile_img?: string | null;
  rating: number;
  komentar?: string;
  diedit?: string;
  total_likes: number;
  total_balasan: number;
  created?: string;
  isLiked?: boolean;
};

export type Comment = {
  id: number;
  username: string;
  parent_comment_id?: number | null;
  depth: number;
  root_comment_id?: number | null;
  profile_img?: string | null;
  komentar: string;
  diedit?: string;
  created?: string;
  total_likes: number;
  total_balasan: number;
  isLiked?: boolean;
  replies?: Comment[] | null;
};

export type Meta = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};
export type ApiList<T> = { data: T[]; meta?: Meta; message?: string };

export type ReadingHistory = {
  id?: number;
  art_id?: number;
  chapter_id?: number;
  latest_chapter_id?: number;
  page_number?: number;
  scroll_position?: number;
  progress_percent?: number;
  title?: string;
  cover_img?: string | null;
  category?: string;
};
