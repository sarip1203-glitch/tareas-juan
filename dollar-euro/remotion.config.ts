// Configuración de render. Cada opción también existe como flag de la CLI:
// https://remotion.dev/docs/config

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// MP4 H.264 + AAC, compatible con TikTok, Reels y Shorts.
Config.setCodec("h264");
Config.setAudioCodec("aac");
Config.setPixelFormat("yuv420p");
Config.setJpegQuality(92);

// Si Remotion no puede descargar su Chrome (redes restringidas), indicar un
// Chromium/Chrome Headless Shell local con la variable REMOTION_BROWSER.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
