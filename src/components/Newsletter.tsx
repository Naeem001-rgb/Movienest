"use client";
import { useState } from "react";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const subscribe = () => {
    if (email.trim() && isValidEmail(email.trim())) {
      setToast({ kind: "success", message: "Thank you for subscribing! We'll keep you updated." });
      setEmail("");
    } else {
      setToast({ kind: "error", message: "Please enter a valid email address." });
    }
  };

  return (
    <>
      {toast && (
        <div
          role="status"
          className="fixed right-5 top-20 z-[60] rounded-lg px-5 py-3 text-sm font-medium text-white shadow-[var(--shadow)]"
          style={{ backgroundColor: toast.kind === "success" ? "#28a745" : "#dc3545" }}
        >
          {toast.message}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && subscribe()}
          placeholder="Your email address"
          aria-label="Email address for newsletter"
          className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-text placeholder:text-text-secondary focus:border-accent focus:outline-none"
        />
        <button
          onClick={subscribe}
          className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast transition hover:opacity-90"
        >
          Subscribe
        </button>
      </div>
    </>
  );
}
