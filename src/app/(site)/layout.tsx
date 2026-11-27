import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";

// Docs and privacy: static, server-rendered, with the same navbar and footer as the landing page.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
