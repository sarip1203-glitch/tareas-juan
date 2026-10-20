import React from "react";
import { AbsoluteFill } from "remotion";

// Iluminación cálida + viñeta para dar sensación cinematográfica.
export const CinematicGrade: React.FC<{ tone?: "present" | "flashback" }> = ({ tone = "present" }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        background:
          tone === "flashback"
            ? "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0) 45%, rgba(255,250,235,0.85) 100%)"
            : "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 50%, rgba(30,12,0,0.55) 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          tone === "flashback"
            ? "linear-gradient(180deg, rgba(255,236,200,0.18), rgba(255,210,170,0.12))"
            : "linear-gradient(160deg, rgba(255,190,110,0.16), rgba(120,60,20,0.08))",
        mixBlendMode: "soft-light",
      }}
    />
  </AbsoluteFill>
);
