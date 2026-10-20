import React from "react";
import { StudioScene } from "../scenes/StudioScene";
import type { Segment } from "../utils/timeline";

// Plano de reacción: encuadra al que escucha mientras el otro habla (voz en
// off), con una entrada de zoom rápida para marcar el chiste.
export const ReactionShot: React.FC<{ segment: Segment }> = ({ segment }) => (
  <StudioScene segment={segment} snapIn />
);
