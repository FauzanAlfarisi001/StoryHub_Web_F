import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storyhub } from "../api/storyhub";
import { useAuth } from "../context/AuthContext";

export function LikeButton({
  parent,
  parentId,
  targetType,
  targetId,
  count = 0,
}: {
  parent: "arts" | "chapters";
  parentId: number;
  targetType: "reviews" | "comments";
  targetId: number;
  count?: number;
}) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(Number(count) || 0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLikes(Number(count) || 0);
  }, [count]);

  useEffect(() => {
    let alive = true;
    if (!user || !targetId || !parentId) {
      setLiked(false);
      return;
    }
    storyhub
      .isLiked(parent, parentId, targetType, targetId)
      .then((r) => {
        if (alive) setLiked(Boolean(r.isLiked));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [user?.id, parent, parentId, targetType, targetId]);

  const toggle = async () => {
    if (!user) {
      nav("/login");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      if (liked) {
        await storyhub.unlike(parent, parentId, targetType, targetId);
        setLiked(false);
        setLikes((v) => Math.max(0, v - 1));
      } else {
        await storyhub.like(parent, parentId, targetType, targetId);
        setLiked(true);
        setLikes((v) => v + 1);
      }
    } catch (e: any) {
      alert(e.message || "Gagal mengubah like.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={liked ? "Unlike" : "Like"}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition ${liked ? "bg-rose-50 text-rose-600" : "bg-gray-50 text-gray-500 hover:bg-gray-100"} disabled:opacity-50`}
    >
      <Heart size={13} fill={liked ? "currentColor" : "none"} />
      {likes}
    </button>
  );
}
