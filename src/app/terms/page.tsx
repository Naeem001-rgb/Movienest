import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — Movie Nest",
  description: "The terms and conditions for using Movie Nest.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        This Agreement contains the complete terms and conditions that apply to your participation
        in our site. If you wish to use the site including its tools and services please read
        these terms of use carefully. By accessing this site or using any part of the site or any
        content or services hereof, you agree to become bound by these terms and conditions. If you
        do not agree to all the terms and conditions, then you may not access the site or use the
        content or any services in the site.
      </p>

      <h2>Modifications of Terms and Conditions</h2>
      <p>
        Amendments to this agreement can be made and effected by us from time to time without
        specific notice to your end. Agreement posted on the Site reflects the latest agreement and
        you should carefully review the same before you use our site.
      </p>

      <h2>Use of the Site</h2>
      <p>You are prohibited from performing the following acts:</p>
      <p>Prohibited Activities:</p>
      <ul>
        <li>
          (a) Use our sites, including its services and/or tools if you are not able to form
          legally binding contracts, are under the age of 18, or are temporarily or indefinitely
          suspended from using our sites, services, or tools
        </li>
        <li>(b) Posting of items in inappropriate category or areas on our sites and services</li>
        <li>(c) Collecting information about users&apos; personal information</li>
        <li>(d) Maneuvering the price of any item or interfere with other users&apos; listings</li>
        <li>(f) Post false, inaccurate, misleading, defamatory, or libelous content</li>
        <li>(g) Take any action that may damage the rating system</li>
      </ul>

      <h2>Registration Information</h2>
      <p>
        For you to complete the sign-up process in our site, you must provide your full legal name,
        current address, a valid email address, member name and any other information needed in
        order to complete the signup process.
      </p>
      <p>Important Requirements:</p>
      <ul>
        <li>You must qualify that you are 18 years or older</li>
        <li>You must be responsible for keeping your password secure</li>
        <li>You are responsible for all activities and contents that are uploaded under your account</li>
        <li>You must not transmit any worms or viruses or any code of a destructive nature</li>
      </ul>
      <p>
        Any information provided by you or gathered by the site or third parties during any visit
        to the site shall be subject to the terms of Movie Nest&apos;s Privacy Policy.
      </p>
    </LegalPage>
  );
}
