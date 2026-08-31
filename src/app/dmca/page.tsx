import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "DMCA Policy — Movie Nest",
  description: "How to submit a copyright infringement complaint to Movie Nest.",
};

export default function DmcaPage() {
  return (
    <LegalPage title="Digital Millennium Copyright Act (DMCA) Policy">
      <p>
        This Digital Millennium Copyright Act Policy (&quot;Policy&quot;) applies to the Movie Nest
        website (&quot;Website&quot; or &quot;Service&quot;) and any of its related products and
        services (collectively, &quot;Services&quot;) and outlines how this Website operator
        (&quot;Operator&quot;, &quot;we&quot;, &quot;us&quot; or &quot;our&quot;) addresses
        copyright infringement notifications and how you (&quot;you&quot; or &quot;your&quot;)
        may submit a copyright infringement complaint.
      </p>
      <p>
        Protection of intellectual property is of utmost importance to us and we ask our users and
        their authorized agents to do the same. It is our policy to expeditiously respond to clear
        notifications of alleged copyright infringement that comply with the United States Digital
        Millennium Copyright Act (&quot;DMCA&quot;) of 1998.
      </p>

      <h2>What to Consider Before Submitting a Copyright Complaint</h2>
      <p>
        Important Notice: Please note that if you are unsure whether the material you are reporting
        is in fact infringing, you may wish to contact an attorney before filing a notification
        with us.
      </p>
      <p>
        The DMCA requires you to provide your personal information in the copyright infringement
        notification. If you are concerned about the privacy of your personal information, you may
        wish to use an agent to report infringing material for you.
      </p>

      <h2>Notifications of Infringement</h2>
      <p>
        If you are a copyright owner or an agent thereof, and you believe that any material
        available on our Services infringes your copyrights, then you may submit a written
        copyright infringement notification (&quot;Notification&quot;) using the contact details
        below pursuant to the DMCA. All such Notifications must comply with the DMCA requirements.
      </p>
      <p>
        Filing a DMCA complaint is the start of a pre-defined legal process. Your complaint will be
        reviewed for accuracy, validity, and completeness. If your complaint has satisfied these
        requirements, our response may include the removal or restriction of access to the
        allegedly infringing material.
      </p>
      <p>
        Response Process: If we remove or restrict access to materials or terminate any account in
        response to a notification of alleged infringement, we will make a good faith effort to
        contact the affected user with information concerning the removal or restriction of access.
      </p>
      <p>
        Notwithstanding anything to the contrary contained in any portion of this Policy, the
        Operator reserves the right to take no action upon receipt of a DMCA copyright infringement
        notification if it fails to comply with all the requirements of the DMCA for such
        notifications.
      </p>

      <h2>Changes and Amendments</h2>
      <p>
        We reserve the right to modify this Policy or its terms related to the Website and Services
        at any time at our discretion. When we do, we will post a notification on the main page of
        the Website. We may also provide notice to you in other ways at our discretion, such as
        through the contact information you have provided.
      </p>
      <p>
        An updated version of this Policy will be effective immediately upon the posting of the
        revised policy unless otherwise specified. Your continued use of the Website and Services
        after the effective date of the revised Policy (or such other act specified at that time)
        will constitute your consent to those changes.
      </p>

      <h2>Reporting Copyright Infringement</h2>
      <h3>How to Contact Us</h3>
      <p>
        If you would like to notify us of infringing material or activity, we encourage you to
        contact us using the details below:
      </p>
      <ul>
        <li>
          Email: <a href="mailto:support@movienest.com">support@movienest.com</a>
        </li>
        <li>
          Contact Page: Visit our <Link href="/contact">Contact us page</Link>
        </li>
      </ul>
      <p>Response Time: Please allow us 2–5 business working days for an email response.</p>
    </LegalPage>
  );
}
