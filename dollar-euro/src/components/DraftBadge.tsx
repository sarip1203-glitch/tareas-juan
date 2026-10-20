import React from "react";
import { characterRenderMode } from "./character/Character";
import { useEpisode } from "./EpisodeContext";

// Aviso visible de que el video contiene recursos PROVISIONALES.
// Se desactiva con la prop `showDraftBadges: false`.
export const DraftBadge: React.FC = () => {
  const { ep, showDraftBadges } = useEpisode();
  if (!showDraftBadges) return null;
  const missing = ep.stats.missingAudio.length;
  const rig = (["dollar", "euro"] as const).filter((id) => characterRenderMode(id) === "rig").length;
  const items: string[] = [];
  if (missing > 0) items.push(`SIN VOCES: ${missing}/${ep.stats.lines} audios pendientes (tiempos estimados)`);
  if (rig > 0) items.push("PERSONAJES PROVISIONALES (sin fotos reales)");
  if (items.length === 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        left: 40,
        right: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 6,
        fontFamily: "monospace",
        fontSize: 22,
        fontWeight: 700,
      }}
    >
      <div style={{ background: "#E2372B", color: "#fff", padding: "4px 12px", borderRadius: 8 }}>BORRADOR</div>
      {items.map((t) => (
        <div key={t} style={{ background: "rgba(0,0,0,0.65)", color: "#FFE9A8", padding: "3px 10px", borderRadius: 6 }}>
          {t}
        </div>
      ))}
    </div>
  );
};
