import { Star } from "lucide-react";

export function StarRating({
  value,
  onChange,
  max = 10,
  size = 18,
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: number;
}) {
  return (
    <div
      className="flex flex-wrap gap-0.5"
      aria-label={`Rating ${value} dari ${max}`}
    >
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const active = n <= value;
        return (
          <button
            key={n}
            type="button"
            aria-label={`${n} bintang`}
            onClick={() => onChange(n)}
            className={`rounded-md p-1 transition hover:bg-violet-50 ${active ? "text-primary" : "text-gray-300"}`}
          >
            <Star size={size} fill={active ? "currentColor" : "none"} />
          </button>
        );
      })}
    </div>
  );
}
