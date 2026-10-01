import {
  BookOpen,
  Compass,
  Heart,
  Mail,
  PenLine,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-14 border-t border-[#e8e8eb] bg-white">
      <div className="mx-auto grid w-full gap-9 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_.8fr_.8fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/storyhub-logo.png"
              className="h-10 w-10 rounded-xl object-cover"
            />
            <div>
              <div className="text-[17px] font-extrabold tracking-[-0.02em]">
                StoryHub
              </div>
              <div className="text-[11px] text-[#8b8b92]">
                Novel · Comic · Game
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-[13px] leading-6 text-[#77777f]">
            Platform untuk membaca cerita, mereview suatu karya, dan membangun
            komunitas bersama para author StoryHub.
          </p>
        </div>
        <div>
          <div className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#8b8b92]">
            Explore
          </div>
          <div className="mt-4 grid gap-3 text-[13px] font-semibold text-[#4f4f57]">
            <Link className="hover:text-primary" to="/">
              Home
            </Link>
            <Link className="hover:text-primary" to="/discover">
              <span className="inline-flex items-center gap-2">
                <Compass size={14} /> Discover
              </span>
            </Link>
            <Link className="hover:text-primary" to="/my-list">
              <span className="inline-flex items-center gap-2">
                <BookOpen size={14} /> My List
              </span>
            </Link>
          </div>
        </div>
        <div>
          <div className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#8b8b92]">
            StoryHub
          </div>
          <div className="mt-4 grid gap-3 text-[13px] font-semibold text-[#4f4f57]">
            <Link className="hover:text-primary" to="/profile">
              Profile
            </Link>
            <Link className="hover:text-primary" to="/my-works">
              <span className="inline-flex items-center gap-2">
                <PenLine size={14} /> My Works
              </span>
            </Link>
            <a
              className="inline-flex items-center gap-2 hover:text-primary"
              href="mailto:hujanbirux@gmail.com"
            >
              <Mail size={14} /> Contact
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[#eeeeef]">
        <div className="mx-auto flex w-full flex-col gap-2 px-4 py-4 text-[11px] text-[#92929a] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>
            © {new Date().getFullYear()} StoryHub. All rights reserved.
          </span>
          <span className="inline-flex items-center gap-1.5">
            Made with{" "}
            <Heart size={12} fill="currentColor" className="text-primary" />{" "}
            from Hujan Biru Studio.
          </span>
        </div>
      </div>
    </footer>
  );
}
