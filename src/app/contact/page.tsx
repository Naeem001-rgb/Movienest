import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Contact — Movie Nest",
  description: "Get in touch with the Movie Nest team.",
};

export default function ContactPage() {
  return (
    <LegalPage title="Get in Touch">
      <p>
        Have questions, suggestions, or need support? We&apos;d love to hear from you. Our team is
        here to help make your Movie Nest experience amazing.
      </p>

      <h2>Let&apos;s Connect</h2>
      <p>Choose the best way to reach us. We&apos;re committed to providing you with quick and helpful responses.</p>

      <h2>Email Support</h2>
      <ul>
        <li>
          General support:{" "}
          <a href="mailto:support@movienest.com">support@movienest.com</a>
        </li>
        <li>Response time: 2–5 business days</li>
        <li>DMCA reports: copyright infringement issues</li>
        <li>Bug reports: technical issues &amp; improvements</li>
      </ul>

      <h2>Frequently Asked Questions</h2>

      <h3>How do I report copyright infringement?</h3>
      <p>
        Please visit our <Link href="/dmca">DMCA page</Link> for detailed instructions on how to
        submit a copyright infringement notification. You can also email us directly at
        support@movienest.com with &quot;DMCA&quot; in the subject line.
      </p>

      <h3>How long does it take to get a response?</h3>
      <p>
        We typically respond to all inquiries within 2–5 business days. For urgent matters like DMCA
        reports or security issues, we aim to respond within 24–48 hours.
      </p>

      <h3>Can I suggest new features or improvements?</h3>
      <p>
        Absolutely! We love hearing from our users. Email us with &quot;Feature Request&quot; in
        the subject line. We review all suggestions and consider them for future updates.
      </p>

      <h3>Is my personal information secure?</h3>
      <p>
        Yes, we take your privacy seriously. See our <Link href="/privacy">Privacy Policy</Link>{" "}
        for details on how we handle your information.
      </p>
    </LegalPage>
  );
}
