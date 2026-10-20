# Personajes

Esta carpeta tiene las capas de la marioneta 2.5D realista de cada perro.
Se generan con `scripts/prepare-photo-puppet.py` a partir de
`docs/referencias/estilo-<perro>.webp` y de los puntos de `src/config/puppets.json`:

- `body.png`: el perro completo sin el núcleo de la cabeza.
- `head.png`: la cabeza con borde suavizado (gira, se inclina y asiente).
- `jaw.png`: la mandíbula inferior (baja al hablar).

Las tres tienen el tamaño de la imagen original.

Si se borran, el sistema vuelve al rig SVG dibujado. Ese rig usa los colores
de las fotos reales (`palette` y `markings` en `src/config/characters.ts`).
Otra alternativa es un solo recorte sin fondo, `cutout.png`, que solo
respira y se inclina.

No intercambien nunca colores, manchas, tamaños ni imágenes entre Dollar y Euro.
