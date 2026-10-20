import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Tipografías alojadas en public/fonts (licencia OFL, ver OFL-*.txt).
// Van dentro del proyecto para que el render funcione sin conexión.
// Incluyen tildes, ñ, ¿ y ¡.

export const FONTS = {
  captions: "Baloo2Local",
  title: "LilitaOneLocal",
};

loadFont({
  family: FONTS.captions,
  url: staticFile("fonts/Baloo2-latin-variable.woff2"),
  weight: "400 800",
});
loadFont({
  family: FONTS.title,
  url: staticFile("fonts/LilitaOne-latin.woff2"),
  weight: "400",
});
