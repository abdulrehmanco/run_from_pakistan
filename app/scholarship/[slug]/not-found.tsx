import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Scholarship not found</h1>
        <p className="text-muted-foreground">
          We couldn&apos;t find that scholarship. It may have been renamed or
          removed.
        </p>
        <Link href="/" className={buttonVariants({ variant: "default" })}>
          Back to all scholarships
        </Link>
      </main>
    </div>
  );
}
