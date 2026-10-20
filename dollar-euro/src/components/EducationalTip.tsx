import React from "react";
import { interpolate, spring } from "remotion";
import { FONTS } from "../config/fonts";
import { SAFE_ZONE } from "../config/video";
import type { Segment } from "../utils/timeline";
import { useEpisode } from "./EpisodeContext";
import { TIP_ILLUSTRATIONS, TIP_SIZE } from "./TipIllustrations";

// Tablero educativo que aparece encima de los perros en la escena del
// consejo. Una ilustración por línea + la fórmula que se va iluminando.

export const EducationalTip: React.FC<{ segment: Segment }> = ({ segment }) => {
  const { ep, frame } = useEpisode();
  const fps = ep.fps;
  const lines = ep.lines.filter((l) => segment.lineIds.includes(l.id) && l.tip);
  const current = [...lines].reverse().find((l) => frame >= l.startFrame) ?? lines[0];
  if (!current || !current.tip) return null;

  const local = frame - segment.from;
  const enter = spring({ frame: local, fps, config: { damping: 16, stiffness: 120 } });
  const exit = interpolate(frame, [segment.from + segment.durationInFrames - 8, segment.from + segment.durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sinceLine = frame - current.startFrame;
  const swap = spring({ frame: sinceLine, fps, config: { damping: 13, stiffness: 180 } });
  const Illu = TIP_ILLUSTRATIONS[current.tip.illustration];

  // Elementos de la fórmula encendidos hasta ahora.
  const formula = ep.def.formula;
  const lit = new Set<number>();
  let complete = false;
  for (const l of lines) {
    if (frame < l.startFrame || !l.tip?.formulaStep) continue;
    if (l.tip.formulaStep > formula.length) complete = true;
    else lit.add(l.tip.formulaStep - 1);
  }
  if (complete) formula.forEach((_, i) => lit.add(i));
  const completeAt = lines.find((l) => (l.tip?.formulaStep ?? 0) > formula.length)?.startFrame ?? Infinity;
  const celebrate = complete ? spring({ frame: frame - completeAt, fps, config: { damping: 8 } }) : 0;

  const boardWidth = 1080 - SAFE_ZONE.left - SAFE_ZONE.right + 40;
  const scale = (boardWidth - 60) / TIP_SIZE.width;

  return (
    <div
      style={{
        position: "absolute",
        left: SAFE_ZONE.left - 20,
        top: SAFE_ZONE.top + 10,
        width: boardWidth,
        transform: `translateY(${(1 - enter) * -700}px) rotate(${(1 - enter) * -4}deg)`,
        opacity: exit,
        background: "#FFF8EC",
        borderRadius: 36,
        border: "8px solid #3B2414",
        boxShadow: "0 18px 0 rgba(59,36,20,0.55)",
        padding: 22,
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: FONTS.title, fontSize: 34, color: "#3B2414", marginBottom: 12, padding: "0 8px" }}>
        <span>ESCUELA PARA HUMANOS</span>
        <span style={{ background: "#E2372B", color: "#fff", borderRadius: 14, padding: "2px 14px", fontSize: 28 }}>{ep.def.lessonLabel}</span>
      </div>
      <div
        style={{
          position: "relative",
          width: TIP_SIZE.width * scale,
          height: TIP_SIZE.height * scale,
          borderRadius: 24,
          overflow: "hidden",
          border: "5px solid #3B2414",
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, width: TIP_SIZE.width, height: TIP_SIZE.height, transform: `scale(${scale * (0.92 + 0.08 * swap)})`, transformOrigin: "0 0" }}>
          <Illu t={sinceLine} fps={fps} />
        </div>
      </div>
      <div style={{ fontFamily: FONTS.captions, fontWeight: 800, fontSize: 36, color: "#3B2414", textAlign: "center", marginTop: 12, opacity: swap }}>
        {current.tip.caption}
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 10, transform: `scale(${1 + celebrate * 0.08})` }}>
        {formula.map((f, i) => {
          const on = lit.has(i);
          return (
            <React.Fragment key={f}>
              {i > 0 ? <span style={{ fontFamily: FONTS.title, fontSize: 40, color: on ? "#3B2414" : "#C9B9A4" }}>+</span> : null}
              <span
                style={{
                  fontFamily: FONTS.title,
                  fontSize: 38,
                  padding: "4px 16px",
                  borderRadius: 16,
                  background: on ? ["#3FA9FF", "#7BC96F", "#FFD23F"][i % 3] : "#EFE4D4",
                  color: on ? "#14202B" : "#BCA88F",
                  border: `4px solid ${on ? "#3B2414" : "#D9C9B3"}`,
                }}
              >
                {f}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
