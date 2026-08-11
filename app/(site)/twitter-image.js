import { ImageResponse } from "next/og";

/* Generates a 1200x630 PNG at /twitter-image. Twitter doesn't accept SVG OG
   images, so this dynamic PNG endpoint is the canonical share asset. */

export const runtime = "edge";
export const alt = "Jay Pokharna — Half code, half no-code, all production.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#07080a",
          padding: "64px",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
          color: "#e8ecf2",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(#1d2128 1px, transparent 1px), linear-gradient(90deg, #1d2128 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              border: "2px solid #a3ff12",
              color: "#a3ff12",
              fontSize: 22,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            JP
          </div>
          <div
            style={{
              display: "flex",
              color: "#e8ecf2",
              fontSize: 18,
              letterSpacing: 4,
              fontWeight: 500,
            }}
          >
            JAY POKHARNA
          </div>
        </div>

        <div style={{ flex: 1, display: "flex" }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 88,
            color: "#e8ecf2",
            letterSpacing: -3,
            lineHeight: 1.02,
            fontWeight: 600,
            position: "relative",
          }}
        >
          <div style={{ display: "flex" }}>Half code,</div>
          <div
            style={{
              display: "flex",
              color: "#a3ff12",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            half no-code,
          </div>
          <div style={{ display: "flex" }}>all production.</div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            alignItems: "center",
            gap: 14,
            fontSize: 16,
            color: "#a3ff12",
            letterSpacing: 4,
            position: "relative",
            fontWeight: 500,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background: "#a3ff12",
              display: "flex",
            }}
          />
          <div style={{ display: "flex" }}>AI &amp; AUTOMATION ENGINEER</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
