import type { Status } from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const STATUS_STYLES: Record<Status["state"], string> = {
  open: "border-transparent bg-green-600 text-white",
  opening_soon: "border-transparent bg-amber-500 text-white",
  closed: "border-transparent bg-gray-200 text-gray-700",
  unknown: "border-transparent bg-gray-200 text-gray-700",
};

/** The colored status pill. Appends "(est.)" when the status is estimated. */
export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const label = status.headline + (status.estimated ? " (est.)" : "");
  return (
    <Badge className={cn("shrink-0", STATUS_STYLES[status.state], className)}>
      {label}
    </Badge>
  );
}

/** One line under the badge: countdown when a confirmed deadline exists, else the sub text. */
export function StatusLine({ status }: { status: Status }) {
  return (
    <p className="text-sm">
      {status.daysLeft !== null ? (
        <span
          className={cn(
            "font-medium",
            status.daysLeft <= 14 ? "text-red-600" : "text-foreground",
          )}
        >
          {status.daysLeft} {status.daysLeft === 1 ? "day" : "days"} left
        </span>
      ) : status.sub ? (
        <span className="text-muted-foreground">{status.sub}</span>
      ) : (
        <span className="text-muted-foreground">
          Check the official site for dates.
        </span>
      )}
    </p>
  );
}
