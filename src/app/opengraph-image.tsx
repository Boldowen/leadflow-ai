import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Emberza — AI lead qualification and scoring for small sales teams";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const temps = [
  { label: "Hot", color: "#fecaca", border: "#f87171" },
  { label: "Warm", color: "#fde68a", border: "#f59e0b" },
  { label: "Cold", color: "#bae6fd", border: "#38bdf8" },
];

// Rendered once at build time from the supplied logo artwork (src/assets/brand/logo-og.png, cropped from design/brand/logo.png).
export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "src/assets/brand/logo-og.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, background: "#000007", color: "white", padding: 60 }}>
        <img src={logoSrc} width={620} height={194} alt="" />
        <div style={{ fontSize: 46, fontWeight: 700, textAlign: "center", letterSpacing: -1 }}>{"AI lead qualification & scoring"}</div>
        <div style={{ fontSize: 28, color: "#cbd5e1", textAlign: "center" }}>Know which inbound leads to call first.</div>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          {temps.map((t) => (
            <div key={t.label} style={{ display: "flex", padding: "10px 26px", borderRadius: 999, fontSize: 26, color: t.color, border: `2px solid ${t.border}` }}>
              {t.label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
