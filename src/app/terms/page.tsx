import Link from "next/link";

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" effective="October 1, 2026">
      <p>
        These terms govern your use of Research Studio (&quot;the app&quot;, &quot;we&quot;), operated by
        Trushaun Buckley. By using the app you agree to them. If you do not agree, do not use the app.
      </p>

      <h2>1. What the app does</h2>
      <p>
        Research Studio helps you research topics discussed in online communities, draft short-form
        video scripts, render videos, and, when you choose, post those videos to social media accounts
        you connect, such as TikTok, YouTube and Instagram.
      </p>

      <h2>2. Your accounts</h2>
      <p>
        You may only connect social media accounts that you own or are authorized to manage. You are
        responsible for keeping your devices and credentials secure. You can disconnect an account at
        any time from the Accounts page, and you can also revoke access from that platform&apos;s own
        settings.
      </p>

      <h2>3. You control what gets posted</h2>
      <p>
        The app never posts on its own. A video is only sent to a platform after you review it and
        press Approve or Post now for that video, with the visibility you choose. You are responsible
        for every video you approve.
      </p>

      <h2>4. Your content</h2>
      <p>
        You keep ownership of the content you create with the app. You are responsible for making sure
        your videos, captions, voiceovers and background footage do not infringe anyone&apos;s rights,
        are properly licensed, are accurate, and comply with the law and with the rules of each
        platform you post to, including TikTok&apos;s Terms of Service and Community Guidelines and any
        requirement to label AI-generated content.
      </p>

      <h2>5. AI-generated material</h2>
      <p>
        Scripts, captions and voiceovers may be produced with AI services. AI output can be inaccurate
        or incomplete. Review everything before you post it.
      </p>

      <h2>6. Third-party services</h2>
      <p>
        The app relies on third-party services such as TikTok, Google/YouTube, Meta/Instagram and
        text-to-speech providers. Your use of those services is governed by their own terms and privacy
        policies. We are not responsible for their availability or actions, including whether a
        platform accepts, limits or removes a post.
      </p>

      <h2>7. Acceptable use</h2>
      <p>
        Do not use the app to post spam, misleading or deceptive content, harassment, hate speech,
        content that infringes intellectual property, or anything else that breaks the law or a
        platform&apos;s rules. Do not use the app to impersonate others or to manipulate engagement.
      </p>

      <h2>8. No warranty</h2>
      <p>
        The app is provided &quot;as is&quot; and &quot;as available&quot;, without warranties of any
        kind, to the fullest extent permitted by law.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we are not liable for any indirect, incidental,
        special or consequential damages, or for lost profits, data, followers or account access,
        arising from your use of the app.
      </p>

      <h2>10. Changes and termination</h2>
      <p>
        We may update these terms. The effective date above shows when they last changed. We may
        suspend or end access to the app at any time. You may stop using it at any time.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These terms are governed by the laws of Maryland / USA, without regard to conflict-of-law
        rules.
      </p>

      <h2>12. Contact</h2>
      <p>Questions about these terms: Buckleytrushau@gmail.com</p>
    </LegalShell>
  );
}

function LegalShell({
  title,
  effective,
  children,
}: {
  title: string;
  effective: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/" className="display text-lg font-bold">
            Research Studio
          </Link>
          <nav className="flex gap-4 text-sm text-[var(--muted)]">
            <Link href="/">Home</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-12 prose-legal">
        <h1 className="display text-4xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Effective {effective}</p>
        <div className="mt-8 space-y-4 text-[15px] leading-7 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold">
          {children}
        </div>
      </main>
    </div>
  );
}
