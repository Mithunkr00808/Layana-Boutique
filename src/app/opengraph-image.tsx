import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, rgb(248,245,242) 0%, rgb(237,229,220) 55%, rgb(217,202,185) 100%)",
          color: "#1f2937",
          fontFamily: "serif",
          letterSpacing: "-0.02em",
        }}
      >
        <div style={{ fontSize: 40, textTransform: "uppercase", letterSpacing: "0.3em" }}>
          Layana Boutique
        </div>
        <div style={{ fontSize: 76, marginTop: 24, fontStyle: "italic" }}>
          Sarees, Kurties & Kids Wear
        </div>
        <div style={{ fontSize: 30, marginTop: 24, fontFamily: "sans-serif", opacity: 0.82 }}>
          Curated conscious luxury for every celebration
        </div>
      </div>
    ),
    size
  );
}

