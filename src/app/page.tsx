import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)]/80 backdrop-blur-sm sticky top-0 z-20 bg-[color-mix(in_srgb,var(--bg)_82%,transparent)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="display text-xl font-extrabold tracking-tight">
            Research Studio
          </Link>
          <nav className="flex items-center gap-5 text-sm text-[var(--muted)]">
            <Link href="/terms" className="hover:text-[var(--ink)]">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[var(--ink)]">
              Privacy
            </Link>
            <Link href="/studio" className="btn !py-2 !px-4 text-sm">
              Open studio
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="drift absolute -right-24 top-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(11,110,79,0.28),transparent_70%)]" />
            <div className="absolute left-[-120px] bottom-[-80px] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(196,92,38,0.18),transparent_70%)]" />
          </div>
          <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-16 md:grid-cols-[1.15fr_0.85fr] md:items-end md:pt-24">
            <div>
              <p className="rise mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Research Studio
              </p>
              <h1 className="display rise rise-delay-1 max-w-3xl text-4xl font-extrabold leading-[1.05] md:text-6xl">
                Short-form videos from the conversations your niche is already having.
              </h1>
              <p className="rise rise-delay-2 mt-6 max-w-2xl text-lg text-[var(--muted)] md:text-xl">
                Find what a niche community is talking about, draft a script in its own language,
                render a vertical video with voiceover and captions, then post to your TikTok only
                after you review and approve it.
              </p>
              <div className="rise rise-delay-2 mt-8 flex flex-wrap gap-3">
                <Link href="/studio" className="btn">
                  Launch the studio
                </Link>
                <Link href="/studio/accounts" className="btn btn-secondary">
                  Connect accounts
                </Link>
              </div>
            </div>
            <div className="rise rise-delay-2 surface relative overflow-hidden rounded-[28px] p-6 md:p-8">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--hot)]" />
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Creator-controlled pipeline
              </p>
              <ol className="mt-5 space-y-4">
                {[
                  ["Research", "Surfaces recurring questions and debates from niche communities."],
                  ["Script", "Drafts hooks, scripts and captions that fit how the community talks."],
                  ["Render", "Builds a 9:16 video with voiceover, timed captions and animated backgrounds."],
                  ["Review & post", "Nothing posts until you approve that specific video and pick who can see it."],
                ].map(([title, copy], i) => (
                  <li key={title} className="flex gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm text-[var(--muted)]">{copy}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--line)] bg-[color-mix(in_srgb,white_35%,transparent)]">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="display text-3xl font-bold md:text-4xl">How the TikTok integration works</h2>
            <p className="mt-4 max-w-3xl text-[var(--muted)]">
              Connect your own TikTok account with Login Kit. Research Studio reads the account display
              name and uses the Content Posting API to upload videos you have approved. Before each
              post you see the video, caption, and privacy options. Disconnect anytime from Accounts.
            </p>
            <p className="mt-4 max-w-3xl text-[var(--muted)]">
              Research Studio is a self-hosted tool run by its operator for their own accounts. It is
              not a public sign-up service.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-[var(--muted)]">
          <div className="flex gap-4">
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </div>
          <p>© 2026 Trushaun Buckley</p>
        </div>
      </footer>
    </div>
  );
}
