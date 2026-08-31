import type { ReactNode } from "react";

export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-text">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-text-secondary sm:text-base [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-text [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-text [&_li]:ml-5 [&_li]:list-disc [&_a]:text-accent [&_a]:underline">
        {children}
      </div>
    </article>
  );
}
