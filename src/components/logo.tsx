import Image from "next/image";
import Link from "next/link";
import icon from "@/assets/brand/icon.png";

/**
 * Compact brand: the Emberza icon plus the name as real text (crisp on light backgrounds and readable by crawlers).
 * The full logo.png artwork has its own dark background, so it is used on dark surfaces (site footer, social image).
 */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight text-slate-900" aria-label="Emberza home">
      <Image src={icon} alt="" width={28} height={28} loading="eager" className="size-7" />
      <span>Emberza</span>
    </Link>
  );
}
