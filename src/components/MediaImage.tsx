import { useState } from "react";
import { mediaUrl } from "../utils/media";

export function MediaImage({
  src,
  alt = "",
  className = "",
  fallback = "/storyhub-logo.png",
  ...props
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  fallback?: string;
  [key: string]: any;
}) {
  const [failed, setFailed] = useState(false);
  const url = failed ? fallback : mediaUrl(src);
  return (
    <img
      {...props}
      src={url}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
