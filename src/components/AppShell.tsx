import {
  Bookmark,
  Compass,
  Home,
  Library,
  LogIn,
  Menu,
  PenLine,
  Search,
  UserRound,
  X,
} from "lucide-react";
import {
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { UserAvatar } from "./UserAvatar";
import { Footer } from "./Footer";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/my-list", label: "My List", icon: Library },
  { to: "/bookmarks", label: "Bookmark", icon: Bookmark },
];

export function AppShell() {
  const { user } = useAuth();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState("");
  const navg = useNavigate();
  const loc = useLocation();
  const isReader = loc.pathname.startsWith("/read/");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navg(`/search?q=${encodeURIComponent(search.trim())}`);
  };
  if (isReader)
    return (
      <main className="min-h-screen bg-[#111111]">
        <Outlet />
      </main>
    );
  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#1c1c20]">
      <header className="sticky top-0 z-50 border-b border-[#e8e8eb] bg-white/95 backdrop-blur">
        <div className="flex h-[68px] w-full items-center gap-3 px-4 sm:px-6 lg:px-10 2xl:px-14">
          <button
            className="rounded-xl p-2 text-[#67676f] hover:bg-[#f5f5f7] lg:hidden"
            onClick={() => setMenu((v) => !v)}
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button
            onClick={() => navg("/")}
            className="flex shrink-0 items-center gap-2.5 text-left"
          >
            <img
              src="/storyhub-logo.png"
              className="h-9 w-9 rounded-xl object-cover"
            />
            <div className="hidden sm:block">
              <div className="text-[16px] font-extrabold tracking-[-0.03em]">
                StoryHub
              </div>
              <div className="text-[9px] uppercase tracking-[0.16em] text-[#9a9aa1]">
                Novel · Comic · Game
              </div>
            </div>
          </button>
          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-bold transition ${isActive ? "bg-[#f2edff] text-primary" : "text-[#696970] hover:bg-[#f7f7f8] hover:text-[#232329]"}`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/my-works"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-bold transition ${isActive ? "bg-[#f2edff] text-primary" : "text-[#696970] hover:bg-[#f7f7f8]"}`
                }
              >
                <PenLine size={16} />
                My Works
              </NavLink>
            )}
          </nav>
          <form
            onSubmit={submit}
            className="relative ml-auto hidden w-[260px] md:block"
          >
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1a8]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari story, chapter, user..."
              className="h-10 w-full rounded-xl border border-[#ededf0] bg-[#f8f8fa] pl-9 pr-3 text-[12px] outline-none transition focus:border-[#cfc2ff] focus:bg-white focus:ring-3 focus:ring-primary/10"
            />
          </form>
          {user ? (
            <button
              onClick={() => navg("/profile")}
              className="rounded-full"
              aria-label={`Profile ${user.username}`}
            >
              <UserAvatar user={user} size="sm" />
            </button>
          ) : (
            <button
              onClick={() => navg("/login")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1d1d21] px-3.5 py-2.5 text-[12px] font-extrabold text-white"
            >
              <LogIn size={15} />
              Login
            </button>
          )}
        </div>
        {menu && (
          <div className="border-t border-[#ededf0] bg-white px-4 py-3 lg:hidden">
            <form onSubmit={submit} className="relative mb-2">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1a8]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari story, chapter, user..."
                className="h-10 w-full rounded-xl border border-[#ededf0] bg-[#f8f8fa] pl-9 pr-3 text-[12px] outline-none"
              />
            </form>
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenu(false)}
                end={to === "/"}
                className={({ isActive }) =>
                  `mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-bold ${isActive ? "bg-[#f2edff] text-primary" : "text-[#64646c]"}`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/my-works"
                onClick={() => setMenu(false)}
                className="mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-bold text-[#64646c]"
              >
                <PenLine size={17} />
                My Works
              </NavLink>
            )}
          </div>
        )}
      </header>
      <main className="min-h-[calc(100vh-68px)] w-full px-4 pb-24 pt-5 sm:px-6 lg:px-10 lg:pb-12 2xl:px-14">
        <Outlet />
      </main>
      <Footer />
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-[66px] items-center justify-around border-t border-[#e7e7ea] bg-white/95 px-2 backdrop-blur lg:hidden">
        {[...nav, { to: "/profile", label: "Profile", icon: UserRound }].map(
          ({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex min-w-[58px] flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold ${isActive ? "text-primary" : "text-[#96969e]"}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ),
        )}
      </nav>
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8] text-sm text-[#77777f]">
        Memuat StoryHub…
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
export function AccountActions() {
  const { logout } = useAuth();
  const nav = useNavigate();
  return (
    <button
      onClick={async () => {
        await logout();
        nav("/");
      }}
      className="text-[12px] font-bold text-[#77777f] hover:text-[#232329]"
    >
      Logout
    </button>
  );
}
