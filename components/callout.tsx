import { cn } from "@/lib/utils";

// Calm callouts: soft tint + a 3px left border. Never alarm-red.
// The one place callout colors live.
const TONES = {
  warn: "border-[#E9D6A8] border-l-[#E9D6A8] bg-[#FAF1DC] text-[#7A5312]",
  note: "border-[#DAD5C8] border-l-[#DAD5C8] bg-[#F0EEE8] text-[#57524A]",
} as const;

export function Callout({
  tone,
  title,
  children,
}: {
  tone: "warn" | "note";
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-l-[3px] p-4 text-sm",
        TONES[tone],
      )}
    >
      {title && <p className="mb-1 font-semibold">{title}</p>}
      {children}
    </div>
  );
}
