import { Check, Edit3, LogOut, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { storyhub } from "../api/storyhub";
import { useAuth } from "../context/AuthContext";
import type { Art, User } from "../types";
import { ArtCard, HorizontalArtCard } from "../components/ArtCard";
import { UserAvatar } from "../components/UserAvatar";
import {
  Button,
  Card,
  EmptyState,
  Input,
  SectionTitle,
  Spinner,
  Textarea,
} from "../components/ui";
import { formatNumber } from "../utils/media";

function ProfileHeader({
  user,
  children,
}: {
  user: User;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-visible rounded-[20px] border border-[#e8e8eb] bg-white shadow-sm">
      <div className="relative z-0 h-[165px] overflow-hidden rounded-t-[20px] bg-[linear-gradient(135deg,#ece6ff,#d9ccff)]"></div>

      <div className="relative z-10 px-5 pb-6 sm:px-7">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="relative z-20 -mt-10 shrink-0 sm:-mt-12">
            <div className="rounded-full bg-white p-1.5 shadow-lg">
              <div className="rounded-full bg-white p-0.5">
                <UserAvatar user={user} size="lg" />
              </div>
            </div>
          </div>

          <div className="relative z-20 min-w-0 flex-1 pt-1 sm:pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[23px] font-extrabold tracking-[-0.03em] text-[#24242a]">
                {user.name}
              </h1>
            </div>

            <div className="mt-0.5 text-[12px] font-semibold text-[#8b8b93]">
              @{user.username}
            </div>

            <p className="mt-2 max-w-xl text-[12px] leading-5 text-[#6f6f77]">
              {user.bio || "Belum ada bio."}
            </p>
          </div>

          {children && (
            <div className="relative z-20 flex shrink-0 flex-wrap gap-2 sm:pb-1">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function ProfilePage() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [arts, setArts] = useState<Art[]>([]);
  const [reading, setReading] = useState<Art[]>([]);
  const [favorites, setFavorites] = useState<Art[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  useEffect(() => {
    if (!user) return;
    Promise.allSettled([
      storyhub.myArts("published"),
      storyhub.continueReading(),
      storyhub.followerCount(user.id),
      storyhub.followingCount(user.id),
      storyhub.arts({
        page: 1,
        limit: 5,
        urutan: "ratingArtUser",
        order: "DESC",
        sudahDiReview: "true",
      }),
    ]).then(([a, r, f, fo, fav]) => {
      if (a.status === "fulfilled") setArts(a.value.data.slice(0, 6));
      if (r.status === "fulfilled") setReading(r.value.data.slice(0, 6));
      if (f.status === "fulfilled") setFollowers(f.value.total_follower);
      if (fo.status === "fulfilled") setFollowing(fo.value.total_following);
      if (fav.status === "fulfilled") setFavorites(fav.value.data || []);
    });
  }, [user?.id]);
  if (!user) return null;
  return (
    <div className="w-full space-y-7">
      <ProfileHeader user={user}>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => nav("/profile/edit")}>
            <Edit3 size={14} />
            Edit Profile
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              await logout();
              nav("/");
            }}
          >
            <LogOut size={14} />
            Keluar
          </Button>
        </div>
      </ProfileHeader>
      <div className="flex max-w-xl divide-x divide-[#e5e5e8] border-y border-[#eeeeef] py-1">
        <button
          onClick={() => nav(`/user/${user.username}/followers`)}
          className="flex-1 py-2.5 text-left"
        >
          <div className="text-[17px] font-extrabold">
            {formatNumber(followers)}
          </div>
          <div className="text-[10px] text-[#8b8b93]">Followers</div>
        </button>
        <button
          onClick={() => nav(`/user/${user.username}/following`)}
          className="flex-1 py-2.5 pl-6 text-left"
        >
          <div className="text-[17px] font-extrabold">
            {formatNumber(following)}
          </div>
          <div className="text-[10px] text-[#8b8b93]">Following</div>
        </button>
      </div>
      <section>
        <SectionTitle
          title="My Works"
          action={
            <Button variant="ghost" onClick={() => nav("/my-works")}>
              Lihat semua
            </Button>
          }
        />
        {arts.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {arts.map((a) => (
              <ArtCard key={a.id} art={a} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Belum ada karya"
            text="Karya yang kamu terbitkan akan muncul di sini."
          />
        )}
      </section>
      <section>
        <SectionTitle title="Continue Reading" />
        {reading.length ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {reading.map((a) => (
              <HorizontalArtCard
                key={`${a.id}-${a.latest_chapter_id}`}
                art={a}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada riwayat baca." />
        )}
      </section>
      <section>
        <SectionTitle title="Favorite" />
        {favorites.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {favorites.map((a) => (
              <ArtCard key={a.id} art={a} />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada art favorit." />
        )}
      </section>
    </div>
  );
}

export function EditProfilePage() {
  const { user, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
  });
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="mx-auto w-full max-w-[900px]">
      <SectionTitle title="Edit Profile" />
      <Card className="p-5 sm:p-7">
        <div className="flex items-center gap-4 border-b border-[#eeeeef] pb-5">
          <UserAvatar user={user} size="lg" />
          <label className="cursor-pointer text-[12px] font-extrabold text-primary">
            Ganti foto
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
        <div className="mt-6 space-y-4">
          <label className="block text-[12px] font-extrabold">
            Nama
            <Input
              className="mt-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="block text-[12px] font-extrabold">
            Username
            <Input
              className="mt-2"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </label>
          <label className="block text-[12px] font-extrabold">
            Bio
            <Textarea
              className="mt-2 min-h-[110px]"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              maxLength={80}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => nav("/profile")}>
              Batal
            </Button>
            <Button
              onClick={async () => {
                const f = new FormData();
                f.set("name", form.name);
                f.set("username", form.username);
                f.set("bio", form.bio);
                if (file) f.set("profile_img", file);
                try {
                  await storyhub.updateProfile(f);
                  await refreshProfile();
                  nav("/profile");
                } catch (e: any) {
                  alert(e.message);
                }
              }}
            >
              <Check size={14} />
              Simpan
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function UserProfilePage() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const nav = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [arts, setArts] = useState<Art[]>([]);
  const [reading, setReading] = useState<Art[]>([]);
  const [favorites, setFavorites] = useState<Art[]>([]);
  const [following, setFollowing] = useState(false);
  const [isFollower, setIsFollower] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const loadActivity = async (target: User, self: boolean, follow: boolean) => {
    const canShow = self || follow;
    setAllowed(canShow);
    if (!canShow) {
      setArts([]);
      setReading([]);
      setFavorites([]);
      return;
    }
    const [a, r, fav] = await Promise.allSettled([
      self
        ? storyhub.myArts("published")
        : storyhub.userArts(target.username, "published"),
      self
        ? storyhub.continueReading()
        : storyhub.continueReading(target.username),
      storyhub.arts({
        page: 1,
        limit: 10,
        urutan: "ratingArtUser",
        order: "DESC",
        sudahDiReview: "true",
        ...(self ? {} : { usernameUserLain: target.username }),
      }),
    ]);
    setArts(a.status === "fulfilled" ? a.value.data || [] : []);
    setReading(r.status === "fulfilled" ? r.value.data || [] : []);
    setFavorites(fav.status === "fulfilled" ? fav.value.data || [] : []);
  };

  const load = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const u = await storyhub.user(username);
      const target = u.user;
      setUser(target);
      const self = Boolean(me && me.id === target.id);
      const [f, fo, fs] = await Promise.allSettled([
        storyhub.followerCount(target.id),
        storyhub.followingCount(target.id),
        me && !self
          ? storyhub.followStatus(target.id)
          : Promise.resolve({ isFollowing: false, isFollower: false }),
      ]);
      if (f.status === "fulfilled") setFollowers(f.value.total_follower || 0);
      if (fo.status === "fulfilled")
        setFollowingCount(fo.value.total_following || 0);
      const follow =
        fs.status === "fulfilled" ? Boolean(fs.value.isFollowing) : false;
      const follower =
        fs.status === "fulfilled" ? Boolean(fs.value.isFollower) : false;
      setFollowing(follow);
      setIsFollower(follower);
      if (self) {
        setFollowing(false);
        setIsFollower(false);
      }
      await loadActivity(target, self, follow);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [username, me?.id]);
  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  if (!user) return <EmptyState title="User tidak ditemukan" />;

  const toggle = async () => {
    if (!me) {
      nav("/login");
      return;
    }
    try {
      if (following) {
        await storyhub.unfollow(user.id);
        setFollowing(false);
        setAllowed(false);
        setFollowers((v) => Math.max(0, v - 1));
        setArts([]);
        setReading([]);
        setFavorites([]);
      } else {
        await storyhub.follow(user.id);
        setFollowing(true);
        setAllowed(true);
        setFollowers((v) => v + 1);
        await loadActivity(user, false, true);
      }
    } catch (e: any) {
      alert(e.message || "Tidak dapat mengubah status follow.");
    }
  };

  const buttonIsSelf = me?.id === user.id;
  return (
    <div className="w-full space-y-6">
      <ProfileHeader user={user}>
        {!buttonIsSelf && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={following ? "secondary" : "primary"}
              onClick={toggle}
            >
              {following ? <Check size={14} /> : <UserPlus size={14} />}{" "}
              {following ? "Unfollow" : isFollower ? "Follback" : "Follow"}
            </Button>
          </div>
        )}
      </ProfileHeader>
      <div className="flex max-w-xl divide-x divide-[#e5e5e8] border-y border-[#eeeeef] py-1">
        <button
          onClick={() => nav(`/user/${user.username}/followers`)}
          className="flex-1 py-2.5 text-left"
        >
          <div className="text-[17px] font-extrabold">
            {formatNumber(followers)}
          </div>
          <div className="text-[10px] text-[#8b8b93]">Followers</div>
        </button>
        <button
          onClick={() => nav(`/user/${user.username}/following`)}
          className="flex-1 py-2.5 pl-6 text-left"
        >
          <div className="text-[17px] font-extrabold">
            {formatNumber(followingCount)}
          </div>
          <div className="text-[10px] text-[#8b8b93]">Following</div>
        </button>
      </div>
      {allowed ? (
        <>
          <section>
            <SectionTitle title="Karya" />
            <div>
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
                <EmptyState
                  title="User ini belum membuat karya"
                  text="Belum ada karya terbit yang dapat ditampilkan."
                />
              )}
            </div>
          </section>
          <section>
            <SectionTitle title="Sedang Dibaca" />
            {reading.length ? (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {reading.map((a) => (
                  <HorizontalArtCard
                    key={`${a.id}-${a.latest_chapter_id}`}
                    art={a}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="Belum ada riwayat baca." />
            )}
          </section>
          <section>
            <SectionTitle title="Favorit" />
            {favorites.length ? (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {favorites.map((a) => (
                  <div
                    key={a.id}
                    className="w-[160px] shrink-0 sm:w-[172px] lg:w-[184px]"
                  >
                    <ArtCard art={a} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Belum ada art favorit." />
            )}
          </section>
        </>
      ) : (
        <EmptyState
          title="Silahkan follow untuk melihat aktivitas pengguna ini"
          text="Setelah mengikuti pengguna ini, karya, bacaan, dan favoritnya akan tampil di sini."
        />
      )}
    </div>
  );
}

export function FollowListPage() {
  const { username, type } = useParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!username) return;
    storyhub
      .user(username)
      .then((u) =>
        type === "followers"
          ? storyhub.followers(u.user.id)
          : storyhub.following(u.user.id),
      )
      .then((r) => setUsers(r.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [username, type]);
  return (
    <div className="mx-auto w-full max-w-[900px]">
      <SectionTitle title={type === "followers" ? "Followers" : "Following"} />
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : users.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => navTo(`/user/${u.username}`)}
              className="flex items-center gap-3 rounded-[14px] border border-[#e8e8eb] bg-white p-3 text-left"
            >
              <UserAvatar user={u} />
              <div className="min-w-0">
                <div className="truncate text-[13px] font-extrabold">
                  {u.name || u.username}
                </div>
                <div className="truncate text-[11px] text-[#8c8c93]">
                  @{u.username}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title="Belum ada user di sini" />
      )}
    </div>
  );
}
function navTo(path: string) {
  window.location.href = path;
}
