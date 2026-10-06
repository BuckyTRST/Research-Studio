import Link from "next/link";

export default function PrivacyPage() {
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
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="display text-4xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Effective October 1, 2026</p>
        <div className="mt-8 space-y-4 text-[15px] leading-7 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-2">
          <p>
            This policy explains what information Research Studio (&quot;the app&quot;, &quot;we&quot;),
            operated by Trushaun Buckley, collects, how it is used, and the choices you have. Research
            Studio is a self-hosted tool: it runs on the operator&apos;s own computer, and we do not run
            a central server that collects your data.
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li>
              <strong>From TikTok, when you connect your account:</strong> your display name (scope{" "}
              <code>user.info.basic</code>), an access token and a refresh token. If you post, we also
              read the posting options TikTok allows for your account, such as the available privacy
              levels. We do not access your followers, messages, analytics, or other videos.
            </li>
            <li>
              <strong>From YouTube and Instagram, if you connect them:</strong> your channel or account
              name, the Instagram business account ID needed to publish Reels, and access tokens.
            </li>
            <li>
              <strong>Content you create:</strong> research notes, scripts, captions, voiceover text
              and the videos you render or upload.
            </li>
          </ul>
          <p>
            We do not use cookies for tracking, we do not run analytics or advertising, and we do not
            collect payment information.
          </p>

          <h2>How we use it</h2>
          <ul>
            <li>To show you which account is connected.</li>
            <li>
              To upload and publish the videos you approve, with the caption and visibility you choose
              (TikTok scopes <code>video.publish</code> and, if enabled, <code>video.upload</code>).
            </li>
            <li>To refresh access so you don&apos;t have to log in again every time.</li>
          </ul>
          <p>
            We use TikTok data only to provide these features. We do not sell it, rent it, use it for
            advertising, or use it to train AI models.
          </p>

          <h2>Where it is stored</h2>
          <p>
            Access tokens are stored in a local file on the computer running the app and are never sent
            anywhere except back to the platform that issued them. Rendered videos are stored locally
            and deleted automatically after 7 days.
          </p>

          <h2>Who we share it with</h2>
          <ul>
            <li>
              <strong>The platforms you post to</strong> (TikTok, YouTube, Instagram) receive the
              videos and captions you approve.
            </li>
            <li>
              <strong>Text-to-speech providers</strong> (for example ElevenLabs, OpenAI or Microsoft)
              receive the voiceover text of a video, only to generate its audio.
            </li>
            <li>
              <strong>AI providers</strong> may receive research and script text to draft content. They
              do not receive your social media tokens or account data.
            </li>
          </ul>
          <p>We may disclose information if required by law.</p>

          <h2>Retention and deletion</h2>
          <p>
            Tokens are kept until you disconnect the account. Disconnecting an account on the Accounts
            page deletes its tokens and account name from the app immediately. You can also revoke
            access in TikTok under Settings and privacy → Security → Manage app permissions. Videos
            already published stay on the platform until you delete them there.
          </p>

          <h2>Children</h2>
          <p>
            The app is not intended for anyone under 18, and we do not knowingly collect information
            from children.
          </p>

          <h2>Security</h2>
          <p>
            Access is limited to the computer running the app. Only the login callback is reachable
            from the internet while an account is being connected. No system is perfectly secure, but
            we take reasonable steps to protect your information.
          </p>

          <h2>Your rights</h2>
          <p>
            Depending on where you live, you may have rights to access, correct or delete your
            information. Contact us and we will respond.
          </p>

          <h2>Changes</h2>
          <p>We may update this policy. The effective date above shows when it last changed.</p>

          <h2>Contact</h2>
          <p>Buckleytrushau@gmail.com</p>
        </div>
      </main>
    </div>
  );
}
