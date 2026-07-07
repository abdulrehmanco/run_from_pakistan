import type { Scholarship } from "@/types/scholarship";
import type { Status } from "@/lib/status";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/** Turn an ISO alpha-2 code into a flag emoji. Falls back to a globe. */
function flagEmoji(code: string): string {
  const cc = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc) || cc === "XX") return "🌍";
  return String.fromCodePoint(
    ...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

const STATUS_STYLES: Record<Status["state"], string> = {
  open: "border-transparent bg-green-600 text-white",
  opening_soon: "border-transparent bg-amber-500 text-white",
  closed: "border-transparent bg-gray-200 text-gray-700",
  unknown: "border-transparent bg-gray-200 text-gray-700",
};

const GREEN_BADGE = "border-green-600 text-green-700";
const AMBER_BADGE = "border-amber-500 text-amber-700";

export function ScholarshipCard({
  scholarship: s,
  status,
}: {
  scholarship: Scholarship;
  status: Status;
}) {
  const statusLabel = status.headline + (status.estimated ? " (est.)" : "");
  const fee = s.blockers.application_fee;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm text-muted-foreground">
            <span aria-hidden className="mr-1 text-base">
              {flagEmoji(s.country_code)}
            </span>
            {s.country}
          </span>
          <Badge className={cn("shrink-0", STATUS_STYLES[status.state])}>
            {statusLabel}
          </Badge>
        </div>
        <div>
          <h2 className="font-bold leading-snug">{s.name}</h2>
          <p className="text-sm text-muted-foreground">{s.provider}</p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        {/* Deadline / cycle line */}
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

        {/* Funding + degree levels */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="outline"
            className={s.funding_type === "full" ? GREEN_BADGE : AMBER_BADGE}
          >
            {s.funding_type === "full" ? "Fully funded" : "Partial funding"}
          </Badge>
          {s.degree_levels.map((level) => (
            <Badge key={level} variant="secondary">
              {level}
            </Badge>
          ))}
        </div>

        {/* Blocker row */}
        <div className="flex flex-wrap gap-1.5">
          {s.blockers.ielts === "not_required" && (
            <Badge variant="outline" className={GREEN_BADGE}>
              No IELTS
            </Badge>
          )}
          {s.blockers.ielts === "moi_accepted" && (
            <Badge variant="outline" className={GREEN_BADGE}>
              MOI accepted
            </Badge>
          )}
          {s.blockers.ielts === "required" && (
            <Badge variant="outline" className={AMBER_BADGE}>
              IELTS required
            </Badge>
          )}
          {s.blockers.ielts === "varies" && (
            <Badge variant="secondary">IELTS varies</Badge>
          )}
          {fee === null ? (
            <Badge variant="outline" className={GREEN_BADGE}>
              Free to apply
            </Badge>
          ) : (
            <Badge variant="outline" className={AMBER_BADGE}>
              Fee: {fee.amount} {fee.currency}
            </Badge>
          )}
          {s.blockers.admission_required_first && (
            <Badge variant="outline" className={AMBER_BADGE}>
              Admission first
            </Badge>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <Separator />
          {!s.verified && (
            <p className="text-xs text-muted-foreground">
              unverified — confirm officially
            </p>
          )}
          <a
            href={s.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full sm:w-auto",
            )}
          >
            Official site ↗
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
