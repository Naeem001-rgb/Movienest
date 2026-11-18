"use client";
import { useState } from "react";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const subscribe = () => {
    if (isValidEmail(email.trim())) {
      setToast({ kind: "success", message: "Thank you for subscribing! We'll keep you updated." });
      setEmail("");
    } else {
      setToast({ kind: "error", message: "Please enter a valid email address." });
    }
  };

  return (
    <form
      className="footer-subscribe"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        subscribe();
      }}
    >
      <div className="footer-email-field">
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setToast(null);
          }}
          placeholder="Your email address"
          aria-label="Email address for newsletter"
          aria-invalid={toast?.kind === "error"}
          aria-describedby="newsletter-feedback"
        />
        <button type="submit" aria-label="Subscribe to newsletter">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <p
        id="newsletter-feedback"
        className="footer-newsletter-feedback"
        role="status"
        data-kind={toast?.kind}
      >
        {toast?.message}
      </p>
    </form>
  );
}
