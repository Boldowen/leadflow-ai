import { Inter, Space_Grotesk } from "next/font/google";

// Landing-only fonts (the app itself keeps Geist).
export const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter", display: "swap" });
export const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-space", display: "swap" });
