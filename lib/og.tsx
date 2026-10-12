import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

/* Shared 1200×630 Open Graph renderer in the site's style: white with a dot
   grid and a green glow, Instrument Sans headline, jade accent line and
   metric, and the wordmark. Fonts are vendored in assets/fonts (OFL). */

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
  const [semibold, regular] = await Promise.all([
    font("InstrumentSans-SemiBold.woff"),
    font("InstrumentSans-Regular.woff"),
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
          background: "#ffffff",
          padding: "60px 64px",
          position: "relative",
          color: "#0d1b14",
          fontFamily: "Instrument Sans",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "radial-gradient(rgba(13,27,20,0.12) 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
            opacity: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(ellipse 60% 70% at 88% 18%, rgba(18,183,106,0.22), transparent 70%), linear-gradient(180deg, rgba(255,255,255,0) 40%, #ffffff 92%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#0d1b14",
              color: "#ffffff",
              fontSize: 20,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            JP
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: "#0d1b14" }}>Jay Pokharna</div>
        </div>

        <div style={{ flex: 1, display: "flex" }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            color: "#087443",
            position: "relative",
            marginBottom: 18,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 5, background: "#12b76a", display: "flex" }} />
          {eyebrow}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: size,
            fontWeight: 600,
            letterSpacing: -2.5,
            lineHeight: 1.02,
            position: "relative",
            maxWidth: metric ? 820 : 1060,
          }}
        >
          <div style={{ display: "flex" }}>{title}</div>
          {accent ? (
            <div style={{ display: "flex", color: "#087443" }}>
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
            <div style={{ display: "flex", fontSize: 64, fontWeight: 600, color: "#087443", letterSpacing: -2 }}>{metric}</div>
            {metricLabel ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 18,
                  color: "#56635c",
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
            borderTop: "1px solid #e2e9e5",
            fontSize: 19,
            color: "#56635c",
            position: "relative",
          }}
        >
          <div style={{ display: "flex" }}>{footer ?? site.positioning}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#087443" }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: "#12b76a", display: "flex" }} />
            {site.availability.status}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Instrument Sans", data: semibold, weight: 600, style: "normal" },
        { name: "Instrument Sans", data: regular, weight: 400, style: "normal" },
      ],
    }
  );
}
