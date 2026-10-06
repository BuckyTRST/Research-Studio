import { StudioNav } from "@/components/StudioNav";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen max-w-7xl gap-5 px-4 py-4 md:grid-cols-[240px_1fr] md:px-6 md:py-6">
      <div className="md:sticky md:top-6 md:h-[calc(100vh-3rem)]">
        <StudioNav />
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
