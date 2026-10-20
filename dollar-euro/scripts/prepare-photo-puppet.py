"""
Genera las capas de la marioneta 2.5D a partir de una imagen realista del perro.

Entrada: src/config/puppets.json (imagen fuente y puntos: cabeza, mandíbula, ojos).
Salida, en public/characters/<id>/ (todas del mismo tamaño que la imagen):
  body.png  cuerpo sin el núcleo de la cabeza
  head.png  cabeza con borde suavizado (gira e inclina)
  jaw.png   mandíbula inferior (baja al hablar)

Requisitos: Python 3.10+, Pillow, numpy y rembg (quita el fondo, en local):
  pip install "rembg[cpu]" pillow numpy
Uso:
  python scripts/prepare-photo-puppet.py            # los dos perros
  python scripts/prepare-photo-puppet.py euro       # solo uno
Después: npm run assets
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
CONFIG = json.loads((ROOT / "src/config/puppets.json").read_text(encoding="utf-8"))


def ellipse_mask(size, cx, cy, rx, ry, feather):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=255)
    return m.filter(ImageFilter.GaussianBlur(feather)) if feather > 0 else m


def cutout(src: Path) -> Image.Image:
    from rembg import new_session, remove

    session = new_session("isnet-general-use")
    img = Image.open(src).convert("RGB")
    return remove(
        img,
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=15,
        alpha_matting_erode_size=8,
    )


def with_alpha(img: Image.Image, mask: Image.Image) -> Image.Image:
    rgba = np.array(img.convert("RGBA")).astype(np.float32)
    m = np.array(mask).astype(np.float32) / 255.0
    rgba[..., 3] *= m
    rgba[rgba[..., 3] < 1] = 0  # transparente de verdad: el PNG comprime mucho mejor
    return Image.fromarray(rgba.clip(0, 255).astype(np.uint8), "RGBA")


def soften_frame_edges(img: Image.Image, width: int = 70) -> Image.Image:
    """Donde la imagen original corta al perro (cola o grupa en el borde),
    desvanece el pelo para que no quede un corte recto. El borde inferior
    (patas en el suelo) se deja intacto."""
    rgba = np.array(img).astype(np.float32)
    h, w = rgba.shape[:2]
    ramp = np.minimum(1.0, np.arange(width, dtype=np.float32) / width)
    rgba[:, :width, 3] *= ramp[None, :]
    rgba[:, w - width :, 3] *= ramp[::-1][None, :]
    rgba[:width, :, 3] *= ramp[:, None]
    return Image.fromarray(rgba.clip(0, 255).astype(np.uint8), "RGBA")


def build(char_id: str):
    c = CONFIG[char_id]
    out = ROOT / "public/characters" / char_id
    out.mkdir(parents=True, exist_ok=True)
    full = soften_frame_edges(cutout(ROOT / c["source"]))
    size = full.size
    h = c["head"]
    # La cabeza lleva borde suave; el cuerpo pierde solo el núcleo opaco de
    # la cabeza, así no aparece una costura transparente en reposo.
    head_mask = ellipse_mask(size, h["cx"], h["cy"], h["rx"], h["ry"], h["feather"])
    core = ellipse_mask(size, h["cx"], h["cy"], h["rx"] - h["feather"] * 2.2, h["ry"] - h["feather"] * 2.2, h["feather"] * 0.6)
    j = c["jaw"]
    jaw_mask = ellipse_mask(size, j["cx"], j["cy"], j["rx"], j["ry"], j["feather"])

    with_alpha(full, Image.eval(core, lambda v: 255 - v)).save(out / "body.png", optimize=True)
    with_alpha(full, head_mask).save(out / "head.png", optimize=True)
    with_alpha(full, jaw_mask).save(out / "jaw.png", optimize=True)
    print(f"✔ {char_id}: body.png, head.png, jaw.png ({size[0]}×{size[1]})")


if __name__ == "__main__":
    ids = sys.argv[1:] or [k for k in CONFIG if not k.startswith("_")]
    for i in ids:
        build(i)
