import { ImageResponse } from "next/og";

/* Generates a 1200x630 PNG at /opengraph-image.
   Twitter and most link-unfurling services prefer PNG/JPEG over SVG, so we
   render this dynamically rather than only shipping the SVG source. */

export const runtime = "edge";
export const alt = "Jay Pokharna — AI & Automation Engineer. Operational backbones for businesses that have outgrown manual work.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
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
        {/* grid background */}
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
        {/* vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        {/* top brand */}
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
              color: "#e8ecf2",
              fontSize: 18,
              letterSpacing: 4,
              fontWeight: 500,
              display: "flex",
            }}
          >
            JAY POKHARNA
          </div>
        </div>

        {/* spacer */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 96,
            color: "#e8ecf2",
            letterSpacing: -3,
            lineHeight: 1.02,
            fontWeight: 600,
            position: "relative",
          }}
        >
          <div style={{ display: "flex" }}>AI &amp; Automation</div>
          <div
            style={{
              display: "flex",
              color: "#a3ff12",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            Engineer.
          </div>
        </div>

        {/* tagline */}
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 24,
            color: "#aab1bd",
            maxWidth: 900,
            lineHeight: 1.4,
            position: "relative",
          }}
        >
          Operational backbones for businesses that have outgrown manual work.
        </div>

        {/* footer */}
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
          <div style={{ display: "flex" }}>AVAILABLE · Q2</div>
          <div
            style={{
              display: "flex",
              color: "#6b7280",
              marginLeft: 24,
            }}
          >
            POKHARNAJAY.COM
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
