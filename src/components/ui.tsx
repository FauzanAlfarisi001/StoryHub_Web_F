import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[11px] px-4 py-2.5 text-[12px] font-extrabold transition focus:outline-none focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-primary text-white hover:bg-primaryDark",
    secondary:
      "border border-[#ddd6f7] bg-[#f7f4ff] text-primary hover:bg-[#efe9ff]",
    ghost: "text-[#67676f] hover:bg-[#f4f4f6] hover:text-[#25252b]",
    danger: "bg-[#fff0f1] text-[#d04a57] hover:bg-[#ffe6e8]",
  };
  return (
    <button {...p} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
export function Input(p: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...p}
      className={`h-11 w-full rounded-[11px] border border-[#e4e4e8] bg-white px-3.5 text-[13px] outline-none transition placeholder:text-[#aaaab0] focus:border-[#c9b9ff] focus:ring-3 focus:ring-primary/10 ${p.className || ""}`}
    />
  );
}
export function Textarea(p: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...p}
      className={`w-full rounded-[11px] border border-[#e4e4e8] bg-white px-3.5 py-3 text-[13px] leading-6 outline-none transition placeholder:text-[#aaaab0] focus:border-[#c9b9ff] focus:ring-3 focus:ring-primary/10 ${p.className || ""}`}
    />
  );
}
export function Card({
  children,
  className = "",
  ...p
}: {
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...p}
      className={`rounded-[16px] border border-[#e8e8eb] bg-white ${className}`}
    >
      {children}
    </div>
  );
}
export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#f2edff] px-2.5 py-1 text-[10px] font-extrabold text-primary ${className}`}
    >
      {children}
    </span>
  );
}
export function SectionTitle({
  title,
  action,
}: {
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2 className="text-[18px] font-extrabold tracking-[-0.02em] text-[#222228]">
        {title}
      </h2>
      {action}
    </div>
  );
}
export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="rounded-[16px] border border-dashed border-[#dedee3] bg-white px-6 py-12 text-center">
      <div className="text-[14px] font-extrabold text-[#36363c]">{title}</div>
      {text && (
        <p className="mt-1 text-[12px] leading-5 text-[#8b8b93]">{text}</p>
      )}
    </div>
  );
}
export function Spinner() {
  return (
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/15 border-t-primary" />
  );
}
