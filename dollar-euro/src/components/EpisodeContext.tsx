import React, { createContext, useContext } from "react";
import type { ResolvedEpisode } from "../utils/timeline";

// Da acceso al episodio resuelto y al fotograma GLOBAL desde cualquier
// componente, aunque esté dentro de un <Sequence> (cuyo frame es local).

type Value = { ep: ResolvedEpisode; frame: number; showDraftBadges: boolean };

const Ctx = createContext<Value | null>(null);

export const EpisodeProvider: React.FC<Value & { children: React.ReactNode }> = ({ children, ...value }) => (
  <Ctx.Provider value={value}>{children}</Ctx.Provider>
);

export const useEpisode = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useEpisode() debe usarse dentro de <EpisodeProvider>");
  return v;
};
