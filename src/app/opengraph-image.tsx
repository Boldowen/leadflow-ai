import { ImageResponse } from "next/og";
import { BrandMark } from "./brand-image";

export const alt = "Emberza — know which leads to call first";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const temps = [
  { label: "Hot", color: "#b91c1c", bg: "#fef2f2" },
  { label: "Warm", color: "#b45309", bg: "#fffbeb" },
  { label: "Cold", color: "#0369a1", bg: "#f0f9ff" },
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#f8fafc", color: "#0f172a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <BrandMark size={72} />
          <div style={{ fontSize: 44, fontWeight: 700 }}>Emberza</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05 }}>
            Know which leads to call&nbsp;<span style={{ color: "#4f46e5" }}>first.</span>
          </div>
          <div style={{ fontSize: 32, color: "#475569" }}>AI summarizes every inbound lead, scores it and suggests the next step.</div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {temps.map((t) => (
            <div key={t.label} style={{ display: "flex", padding: "12px 28px", borderRadius: 999, fontSize: 28, fontWeight: 600, color: t.color, background: t.bg }}>
              {t.label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
