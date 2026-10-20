import React from "react";
import { CHARACTERS } from "../config/characters";
import { characterRenderMode } from "./character/Character";
import { useEpisode } from "./EpisodeContext";

// Aviso visible de que el video contiene recursos PROVISIONALES.
// Se desactiva con la prop `showDraftBadges: false`.
export const DraftBadge: React.FC = () => {
  const { ep, showDraftBadges } = useEpisode();
  if (!showDraftBadges) return null;
  const missing = ep.stats.missingAudio.length;
  const rigIds = (["dollar", "euro"] as const).filter((id) => characterRenderMode(id) === "rig");
  const noPhotos = rigIds.some((id) => CHARACTERS[id].palettesAreProvisional);
  const items: string[] = [];
  if (missing > 0) items.push(`SIN VOCES: ${missing}/${ep.stats.lines} audios pendientes (tiempos estimados)`);
  if (noPhotos) items.push("PERSONAJES PROVISIONALES (sin fotos reales)");
  else if (rigIds.length > 0) items.push("PERSONAJES 2.5D PROVISIONALES (colores de las fotos, sin animación final)");
  else items.push("PERSONAJES 2.5D POR CAPAS (sin animación 3D final)");
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
