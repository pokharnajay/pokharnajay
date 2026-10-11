import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

/* Shared 1200×630 Open Graph renderer in the site's style: near-black grid,
   mono eyebrow, display headline with a lime italic second line, a lime
   metric and the wordmark. Fonts are vendored in assets/fonts (OFL). */

export const OG_SIZE = { width: 1200, height: 630 };

const font = (file: string) => fs.readFile(path.join(process.cwd(), "assets", "fonts", file));

export async function renderOg({
  eyebrow,
  title,
  accent,
  metric,
  metricLabel,
  footer,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  metric?: string;
  metricLabel?: string;
  footer?: string;
}) {
  const [display, displayRegular, mono] = await Promise.all([
    font("SpaceGrotesk-Medium.woff"),
    font("SpaceGrotesk-Regular.woff"),
    font("JetBrainsMono-Medium.woff"),
  ]);
  const long = title.length + (accent?.length ?? 0) > 46;
  const size = long ? 64 : 84;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#07080a",
          padding: "60px 64px",
          position: "relative",
          color: "#e8ecf2",
          fontFamily: "Space Grotesk",
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
            opacity: 0.55,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(ellipse 70% 60% at 85% 20%, rgba(163,255,18,0.12), transparent 70%), radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.65) 100%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "2px solid #a3ff12",
              color: "#a3ff12",
              fontSize: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            JP
          </div>
          <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 18, letterSpacing: 4, color: "#e8ecf2" }}>
            JAY POKHARNA
          </div>
        </div>

        <div style={{ flex: 1, display: "flex" }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: "JetBrains Mono",
            fontSize: 18,
            letterSpacing: 4,
            color: "#a3ff12",
            textTransform: "uppercase",
            position: "relative",
            marginBottom: 20,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 5, background: "#a3ff12", display: "flex" }} />
          {eyebrow}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: size,
            letterSpacing: -2.5,
            lineHeight: 1.02,
            position: "relative",
            maxWidth: metric ? 820 : 1060,
          }}
        >
          <div style={{ display: "flex" }}>{title}</div>
          {accent ? (
            <div style={{ display: "flex", color: "#a3ff12", fontStyle: "italic", fontFamily: "Space Grotesk Regular" }}>
              {accent}
            </div>
          ) : null}
        </div>

        {metric ? (
          <div
            style={{
              position: "absolute",
              right: 64,
              bottom: 128,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", fontSize: 64, color: "#a3ff12", letterSpacing: -2 }}>{metric}</div>
            {metricLabel ? (
              <div
                style={{
                  display: "flex",
                  fontFamily: "JetBrains Mono",
                  fontSize: 15,
                  letterSpacing: 3,
                  color: "#aab1bd",
                  textTransform: "uppercase",
                  maxWidth: 300,
                  textAlign: "right",
                }}
              >
                {metricLabel}
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 36,
            paddingTop: 22,
            borderTop: "1px solid #2a2f38",
            fontFamily: "JetBrains Mono",
            fontSize: 16,
            letterSpacing: 3,
            color: "#7d8491",
            textTransform: "uppercase",
            position: "relative",
          }}
        >
          <div style={{ display: "flex" }}>{footer ?? site.positioning}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#a3ff12" }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: "#a3ff12", display: "flex" }} />
            {site.availability.status}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Space Grotesk", data: display, weight: 500, style: "normal" },
        { name: "Space Grotesk Regular", data: displayRegular, weight: 400, style: "normal" },
        { name: "JetBrains Mono", data: mono, weight: 500, style: "normal" },
      ],
    }
  );
}
