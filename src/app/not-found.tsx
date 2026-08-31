import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl" aria-hidden="true">
        🎬
      </span>
      <h1 className="mt-4 text-4xl font-extrabold text-text">404</h1>
      <h2 className="mt-2 text-xl font-semibold text-text">This title isn&apos;t in the nest</h2>
      <p className="mt-3 text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-accent px-7 py-3 text-sm font-bold text-accent-contrast transition hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  );
}
