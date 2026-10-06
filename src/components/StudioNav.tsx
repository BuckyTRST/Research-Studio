"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/studio", label: "Dashboard" },
  { href: "/studio/niches", label: "Niches" },
  { href: "/studio/research", label: "Research" },
  { href: "/studio/scripts", label: "Scripts" },
  { href: "/studio/review", label: "Review" },
  { href: "/studio/accounts", label: "Accounts" },
];

export function StudioNav() {
  const pathname = usePathname();
  return (
    <aside className="surface flex h-full flex-col rounded-[24px] p-5">
      <Link href="/" className="display text-2xl font-extrabold">
        Research Studio
      </Link>
      <p className="mt-1 text-sm text-[var(--muted)]">Self-hosted creator pipeline</p>
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/studio" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:bg-black/5 hover:text-[var(--ink)]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <Link href="/" className="mt-4 text-sm text-[var(--muted)] hover:text-[var(--ink)]">
        ← Marketing site
      </Link>
    </aside>
  );
}
