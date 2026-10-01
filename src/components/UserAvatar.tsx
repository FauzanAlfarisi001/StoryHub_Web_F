import type { User } from "../types";
import { MediaImage } from "./MediaImage";

export function UserAvatar({
  user,
  size = "md",
}: {
  user?: Partial<User> | null;
  size?: "sm" | "md" | "lg";
}) {
  const s =
    size === "sm"
      ? "h-8 w-8 text-[11px]"
      : size === "lg"
        ? "h-[76px] w-[76px] text-xl"
        : "h-10 w-10 text-[13px]";
  return (
    <div
      className={`${s} flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#ece7ff] font-extrabold text-primary shadow-sm`}
    >
      {user?.profile_img ? (
        <MediaImage
          src={user.profile_img}
          alt={user.username || "User"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{user?.username?.slice(0, 1).toUpperCase() || "S"}</span>
      )}
    </div>
  );
}
