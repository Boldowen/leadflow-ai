import Image from "next/image";
import Link from "next/link";
import icon from "@/assets/brand/icon.png";

/** Brand mark: the Emberza icon plus the name in the display font (real text, so it stays crisp and crawlable). */
export function Logo({ href = "/", size = 28 }: { href?: string; size?: number }) {
  return (
    <Link href={href} aria-label="Emberza home" className="font-display flex items-center gap-2.5 text-xl font-bold text-white hover:text-white">
      <Image src={icon} alt="" width={size} height={size} loading="eager" />
      Emberza
    </Link>
  );
}
