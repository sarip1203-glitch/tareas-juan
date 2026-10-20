# Fotos y recortes de los personajes

Mientras esta carpeta no tenga imágenes, Dollar y Euro se dibujan con el
rig SVG provisional (colores genéricos de pastor de Shetland).

Por perro (`dollar/` y `euro/`) se admiten dos modos. El sistema los detecta solo:

1. **Recorte único** → `cutout.png`
   Foto del perro sentado, de frente, con fondo transparente (PNG), base de
   las patas en el borde inferior, proporción 3:4 (p. ej. 1200×1600).
   Animación 2.5D limitada: respiración, inclinación y rebote al hablar.
   La boca NO se mueve en este modo.

2. **Capas** → `body.png` + `head.png` (+ `jaw.png` opcional)
   Las tres del mismo tamaño (3:4), alineadas. `head.png` sin mandíbula
   inferior; `jaw.png` solo con la mandíbula. La cabeza gira sobre
   `photo.headPivot` y la mandíbula baja `photo.jawTravelPx` al hablar
   (ajustables en `src/config/characters.ts`).

Pongan también aquí las fotos de referencia originales (`referencias/`)
para ajustar la paleta del rig (`palette` en `src/config/characters.ts`).
No intercambien nunca colores ni manchas entre Dollar y Euro.
