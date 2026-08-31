import Link from "next/link";

export default function Pagination({
  basePath,
  page,
  totalPages,
  extraParams = {},
}: {
  basePath: string;
  page: number;
  totalPages: number;
  extraParams?: Record<string, string>;
}) {
  totalPages = Math.min(totalPages, 500);
  if (totalPages <= 1) return null;

  const qs = (p: number) => {
    const params = new URLSearchParams({ ...extraParams, page: String(p) });
    return `${basePath}?${params.toString()}`;
  };

  // Window of page numbers around the current page, max 7 buttons.
  const numbers: number[] = [];
  const start = Math.max(1, Math.min(page - 3, totalPages - 6));
  const end = Math.min(totalPages, start + 6);
  for (let p = start; p <= end; p++) numbers.push(p);

  const base =
    "rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:border-accent hover:text-accent";
  const disabled = "pointer-events-none opacity-40";

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <Link href={qs(Math.max(1, page - 1))} className={`${base} ${page <= 1 ? disabled : ""}`}>
        Prev
      </Link>
      {start > 1 && <span className="px-1 text-text-secondary">…</span>}
      {numbers.map((p) =>
        p === page ? (
          <span
            key={p}
            aria-current="page"
            className="rounded-lg border border-accent bg-accent px-3 py-2 text-sm font-bold text-accent-contrast"
          >
            {p}
          </span>
        ) : (
          <Link key={p} href={qs(p)} className={`${base} text-text-secondary`}>
            {p}
          </Link>
        )
      )}
      {end < totalPages && <span className="px-1 text-text-secondary">…</span>}
      <Link
        href={qs(Math.min(totalPages, page + 1))}
        className={`${base} ${page >= totalPages ? disabled : ""}`}
      >
        Next
      </Link>
    </nav>
  );
}
