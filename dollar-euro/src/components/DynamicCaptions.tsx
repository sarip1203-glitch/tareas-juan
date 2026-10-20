import React from "react";
import { interpolate, spring } from "remotion";
import { BOTH_CAPTION_COLOR, CHARACTERS } from "../config/characters";
import { FONTS } from "../config/fonts";
import { CAPTION_BOTTOM, SAFE_ZONE, msToFrames } from "../config/video";
import type { WordTiming } from "../utils/assets";
import type { ResolvedLine } from "../utils/timeline";
import { normalizeWord } from "../utils/words";
import { useEpisode } from "./EpisodeContext";

// Subtítulos dinámicos estilo redes: máximo 2 líneas, palabra activa
// resaltada, color por personaje (Dollar azul, Euro amarillo) y palabras
// graciosas destacadas. Sincronizados con los tiempos de palabra del audio.

const FONT_SIZE = 66;
const MAX_CHARS_PER_ROW = 22;
const MAX_ROWS = 2;

type Page = { words: (WordTiming & { i: number })[]; startMs: number; endMs: number };

// Divide la línea en "páginas" de hasta 2 renglones.
export const paginate = (words: WordTiming[]): Page[] => {
  const pages: Page[] = [];
  let rows: string[][] = [[]];
  let current: Page["words"] = [];
  const flush = () => {
    if (current.length === 0) return;
    pages.push({ words: current, startMs: current[0].startMs, endMs: current[current.length - 1].endMs });
    current = [];
    rows = [[]];
  };
  words.forEach((w, i) => {
    const row = rows[rows.length - 1];
    const rowLen = row.join(" ").length;
    if (rowLen > 0 && rowLen + 1 + w.text.length > MAX_CHARS_PER_ROW) {
      if (rows.length >= MAX_ROWS) flush();
      else rows.push([]);
    }
    rows[rows.length - 1].push(w.text);
    current.push({ ...w, i });
    // Cortar página en final de frase si ya hay contenido suficiente.
    if (/[.!?…]$/.test(w.text) && rows.join(" ").length > 14 && i < words.length - 1) flush();
  });
  flush();
  return pages;
};

const speakerColor = (line: ResolvedLine) =>
  line.speaker === "ambos" ? BOTH_CAPTION_COLOR : CHARACTERS[line.speaker].captionColor;

const speakerLabel = (line: ResolvedLine) =>
  line.speaker === "ambos" ? "DOLLAR & EURO" : CHARACTERS[line.speaker].name.toUpperCase();

export const DynamicCaptions: React.FC = () => {
  const { ep, frame } = useEpisode();
  const fps = ep.fps;
  // Línea visible: la que habla ahora o la que acaba de terminar (breve cola).
  const line = ep.lines.find((l) => frame >= l.startFrame - 2 && frame < Math.min(l.spanEndFrame, l.endFrame + msToFrames(400, fps)));
  if (!line) return null;

  const ms = ((frame - line.startFrame) / fps) * 1000;
  const pages = paginate(line.words);
  const pageIndex = Math.max(
    0,
    pages.findIndex((p, i) => ms < (pages[i + 1]?.startMs ?? Infinity) - 60),
  );
  const page = pages[pageIndex];
  if (!page) return null;

  const color = speakerColor(line);
  const highlights = new Set((line.highlight ?? []).map(normalizeWord));
  const pageStartFrame = line.startFrame + msToFrames(page.startMs, fps);
  const pop = spring({ frame: frame - pageStartFrame + 2, fps, config: { damping: 14, stiffness: 220 } });
  const fadeOut = interpolate(frame, [line.endFrame + msToFrames(250, fps), line.endFrame + msToFrames(400, fps)], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: SAFE_ZONE.left,
        right: SAFE_ZONE.right,
        bottom: CAPTION_BOTTOM,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: fadeOut,
        transform: `scale(${0.9 + 0.1 * pop})`,
        transformOrigin: "50% 100%",
      }}
    >
      <div
        style={{
          fontFamily: FONTS.title,
          fontSize: 30,
          letterSpacing: 2,
          color: line.speaker === "ambos" ? "#3B2414" : CHARACTERS[line.speaker].captionTextOnColor,
          background: line.speaker === "ambos" ? `linear-gradient(90deg, ${CHARACTERS.dollar.captionColor}, ${CHARACTERS.euro.captionColor})` : color,
          borderRadius: 12,
          padding: "2px 14px",
          marginBottom: 10,
          border: "3px solid #1A0F08",
        }}
      >
        {speakerLabel(line)}
      </div>
      <div
        style={{
          textAlign: "center",
          fontFamily: FONTS.captions,
          fontWeight: 800,
          fontSize: FONT_SIZE,
          lineHeight: 1.12,
          maxWidth: 1080 - SAFE_ZONE.left - SAFE_ZONE.right,
        }}
      >
        {page.words.map((w) => {
          const active = ms >= w.startMs - 30 && ms < w.endMs + 60;
          const spoken = ms >= w.startMs - 30;
          const funny = highlights.has(normalizeWord(w.text));
          const ws = spring({ frame: frame - (line.startFrame + msToFrames(w.startMs, fps)), fps, config: { damping: 10, stiffness: 260 } });
          const base: React.CSSProperties = {
            display: "inline-block",
            margin: "0 13px",
            color: spoken ? (active ? color : "#FFFFFF") : "rgba(255,255,255,0.55)",
            WebkitTextStroke: "11px #1A0F08",
            paintOrder: "stroke fill",
            transform: `scale(${active ? 1 + 0.12 * ws : 1})`,
            textShadow: "0 6px 0 rgba(0,0,0,0.35)",
          };
          if (funny && spoken) {
            return (
              <span
                key={w.i}
                style={{
                  ...base,
                  color: line.speaker === "ambos" ? "#3B2414" : CHARACTERS[line.speaker].captionTextOnColor,
                  WebkitTextStroke: "0px transparent",
                  textShadow: "none",
                  background: color,
                  borderRadius: 16,
                  padding: "0 12px",
                  border: "5px solid #1A0F08",
                  transform: `rotate(${(w.i % 2 ? 1 : -1) * 3}deg) scale(${1 + 0.1 * ws})`,
                }}
              >
                {w.text}
              </span>
            );
          }
          return (
            <span key={w.i} style={base}>
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
