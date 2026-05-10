import { ImageResponse } from "next/og";

// iOS Home Screen icon. Served at /apple-icon by Next.js convention.
// Rendered on Edge at request time — the ImageResponse/Satori prerender
// path has a Windows-specific `fileURLToPath` bug when building locally,
// which this sidesteps. Output is cached aggressively anyway because the
// icon is static per build.
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0f08",
          // dark outer bezel (iOS will round the corners for us)
          padding: 12,
        }}
      >
        {/* phosphor screen */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#c9a227",
            // glass highlight along top + left
            boxShadow:
              "inset 0 6px 0 #f2d06b, inset 6px 0 0 #d9b43a, inset -6px -6px 0 #8c6b14",
            // the scanline grid baked into the screen itself
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(26,23,16,0.35) 0 2px, rgba(0,0,0,0) 2px 22px)",
          }}
        >
          {/* signal-lock pixel — matches the cursor HOVER state */}
          <div
            style={{
              width: 28,
              height: 28,
              background: "#6b8e5a",
              boxShadow: "0 0 0 4px rgba(107,142,90,0.35)",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
