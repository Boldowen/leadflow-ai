import { Inter, Space_Grotesk } from "next/font/google";

// Site-wide fonts from the Emberza design: Inter for text, Space Grotesk for headings.
export const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter", display: "swap" });
export const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-space", display: "swap" });
