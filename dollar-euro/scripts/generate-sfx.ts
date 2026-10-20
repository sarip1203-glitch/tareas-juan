/**
 * Genera efectos de sonido y una música de fondo PROVISIONAL de forma
 * procedural (síntesis por código: sin muestras de terceros ni derechos).
 * Uso: npm run sfx
 * Salida: public/audio/effects/*.wav y public/audio/music/tema-escuela.wav
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SR = 44100;
const ROOT = join(import.meta.dirname, "..", "public", "audio");

// Generador pseudoaleatorio determinista.
let seed = 1234567;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rand() * 2 - 1;

const writeWav = (path: string, samples: Float32Array) => {
  const data = Buffer.alloc(samples.length * 2);
  let peak = 0;
  for (const s of samples) peak = Math.max(peak, Math.abs(s));
  const norm = peak > 0.98 ? 0.98 / peak : 1;
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s * norm)) * 32767), i * 2));
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([h, data]));
  console.log("✔", path.replace(ROOT, "public/audio"));
};

const buf = (sec: number) => new Float32Array(Math.round(sec * SR));

// Filtro de estado variable (pasa banda / pasa bajos).
const svf = () => {
  let low = 0;
  let band = 0;
  return (x: number, cutoff: number, q = 0.7) => {
    const f = 2 * Math.sin((Math.PI * Math.min(cutoff, SR / 6)) / SR);
    low += f * band;
    const high = x - low - q * band;
    band += f * high;
    return { low, band, high };
  };
};

// Cuerda pulsada (Karplus-Strong): suena a tiple/guitarra.
const pluck = (out: Float32Array, start: number, freq: number, amp: number, decay = 0.996, len = 1.6) => {
  const n = Math.round(SR / freq);
  const ring = new Float32Array(n).map(() => noise() * amp);
  let idx = 0;
  const s0 = Math.round(start * SR);
  const total = Math.round(len * SR);
  for (let i = 0; i < total && s0 + i < out.length; i++) {
    const a = ring[idx];
    const b = ring[(idx + 1) % n];
    ring[idx] = ((a + b) / 2) * decay;
    out[s0 + i] += a;
    idx = (idx + 1) % n;
  }
};

const env = (t: number, attack: number, decay: number) => (t < attack ? t / attack : Math.exp(-(t - attack) / decay));

const fx: Record<string, () => Float32Array> = {
  whoosh: () => {
    const o = buf(0.5);
    const f = svf();
    o.forEach((_, i) => {
      const t = i / SR;
      const sweep = 300 + 3500 * Math.sin((Math.PI * t) / 0.5);
      o[i] = f(noise(), sweep, 0.5).band * Math.sin((Math.PI * t) / 0.5) * 1.4;
    });
    return o;
  },
  pop: () => {
    const o = buf(0.16);
    let ph = 0;
    o.forEach((_, i) => {
      const t = i / SR;
      ph += (2 * Math.PI * (950 * Math.exp(-t * 28) + 180)) / SR;
      o[i] = Math.sin(ph) * env(t, 0.002, 0.04);
    });
    return o;
  },
  boing: () => {
    const o = buf(0.7);
    let ph = 0;
    o.forEach((_, i) => {
      const t = i / SR;
      ph += (2 * Math.PI * (190 + 110 * Math.sin(2 * Math.PI * 11 * t) * Math.exp(-t * 4))) / SR;
      o[i] = Math.sin(ph) * env(t, 0.004, 0.22) * 0.9;
    });
    return o;
  },
  ding: () => {
    const o = buf(1.1);
    o.forEach((_, i) => {
      const t = i / SR;
      const e = env(t, 0.002, 0.35);
      o[i] = (Math.sin(2 * Math.PI * 1318 * t) + 0.5 * Math.sin(2 * Math.PI * 2637 * t) * Math.exp(-t * 6) + 0.3 * Math.sin(2 * Math.PI * 3956 * t) * Math.exp(-t * 9)) * e * 0.5;
    });
    return o;
  },
  drip: () => {
    const o = buf(0.3);
    let ph = 0;
    o.forEach((_, i) => {
      const t = i / SR;
      ph += (2 * Math.PI * (500 + 1500 * Math.min(1, t / 0.05))) / SR;
      o[i] = Math.sin(ph) * env(t, 0.003, 0.05);
    });
    return o;
  },
  splash: () => {
    const o = buf(0.8);
    const f = svf();
    o.forEach((_, i) => {
      const t = i / SR;
      o[i] = f(noise(), 1800 - t * 1500, 0.6).low * env(t, 0.01, 0.18) * 1.2;
      if (t > 0.15 && rand() < 0.0009) {
        for (let k = 0; k < 900 && i + k < o.length; k++) o[i + k] += Math.sin((2 * Math.PI * (700 + k)) * (k / SR)) * Math.exp(-k / 300) * 0.3;
      }
    });
    return o;
  },
  harp: () => {
    const o = buf(2.2);
    [261.6, 329.6, 392, 523.3, 659.3, 784, 1046.5, 1318.5].forEach((f, k) => pluck(o, k * 0.07, f, 0.35, 0.997, 2));
    return o;
  },
  sting: () => {
    const o = buf(2.2);
    [130.8, 261.6, 329.6, 392, 523.3].forEach((f) => pluck(o, 0, f, 0.5, 0.998, 2.2));
    [523.3, 659.3, 784, 1046.5].forEach((f, k) => pluck(o, 0.18 + k * 0.05, f, 0.3, 0.997, 1.8));
    o.forEach((_, i) => {
      const t = i / SR;
      o[i] += Math.sin(2 * Math.PI * (60 + 80 * Math.exp(-t * 30)) * t) * env(t, 0.002, 0.12) * 0.8;
    });
    return o;
  },
  zoom: () => {
    const o = buf(0.4);
    let ph = 0;
    o.forEach((_, i) => {
      const t = i / SR;
      ph += (2 * Math.PI * (200 + 2400 * t * t * 6)) / SR;
      o[i] = (Math.sin(ph) * 0.6 + noise() * 0.15) * Math.sin((Math.PI * t) / 0.4);
    });
    return o;
  },
  scratch: () => {
    const o = buf(0.45);
    const f = svf();
    o.forEach((_, i) => {
      const t = i / SR;
      const c = 900 + 700 * Math.sin(2 * Math.PI * 7 * t);
      o[i] = f(noise(), c, 0.2).band * env(t, 0.005, 0.15) * 2;
    });
    return o;
  },
  glitch: () => {
    const o = buf(0.7);
    let hold = 0;
    let freq = 300;
    o.forEach((_, i) => {
      if (hold-- <= 0) {
        hold = Math.round(SR * (0.02 + rand() * 0.05));
        freq = 120 + rand() * 1600;
      }
      const t = i / SR;
      const sq = Math.sign(Math.sin(2 * Math.PI * freq * t));
      o[i] = Math.round(sq * 4) / 4 * 0.35 * (rand() > 0.15 ? 1 : 0) * Math.min(1, (0.7 - t) * 10);
    });
    return o;
  },
  gulp: () => {
    const o = buf(0.4);
    let ph = 0;
    o.forEach((_, i) => {
      const t = i / SR;
      const k = t < 0.18 ? t / 0.18 : (t - 0.18) / 0.22;
      ph += (2 * Math.PI * (320 - 200 * k)) / SR;
      o[i] = Math.sin(ph) * Math.sin(Math.PI * Math.min(1, k)) * 0.8;
    });
    return o;
  },
};

// Música: 104 BPM, I–V–vi–IV en Do, rasgueo de cuerda pulsada, bajo y
// maraca. 8 compases, en bucle.
const music = () => {
  const bpm = 104;
  const beat = 60 / bpm;
  const bars = 8;
  const o = buf(bars * 4 * beat);
  const chords: number[][] = [
    [261.6, 329.6, 392.0],
    [196.0, 246.9, 293.7],
    [220.0, 261.6, 329.6],
    [174.6, 220.0, 261.6],
  ];
  const roots = [65.4, 49.0, 55.0, 43.65];
  for (let bar = 0; bar < bars; bar++) {
    const c = chords[bar % 4];
    const t0 = bar * 4 * beat;
    // Rasgueo: abajo en tiempos, arriba en contratiempos.
    for (let e = 0; e < 8; e++) {
      const accent = e % 2 === 0 ? 0.32 : 0.18;
      const strum = e % 2 === 0 ? c : [...c].reverse();
      strum.forEach((f, k) => pluck(o, t0 + e * (beat / 2) + k * 0.012, f * 2, accent, 0.994, 0.9));
    }
    // Bajo en 1 y 3.
    [0, 2].forEach((b) => {
      const s = Math.round((t0 + b * beat) * SR);
      for (let i = 0; i < SR * beat * 0.9 && s + i < o.length; i++) {
        const t = i / SR;
        o[s + i] += Math.sin(2 * Math.PI * roots[bar % 4] * 2 * t) * env(t, 0.01, 0.35) * 0.55;
      }
    });
    // Maraca en corcheas.
    const f = svf();
    for (let e = 0; e < 8; e++) {
      const s = Math.round((t0 + e * (beat / 2)) * SR);
      for (let i = 0; i < SR * 0.06 && s + i < o.length; i++) {
        o[s + i] += f(noise(), 6000, 0.4).high * env(i / SR, 0.004, 0.02) * (e % 2 ? 0.12 : 0.07);
      }
    }
    // Melodía de campanitas en la segunda mitad.
    if (bar >= 4) {
      const mel = [[784, 659.3], [784, 587.3], [659.3, 523.3], [587.3, 523.3]][bar % 4];
      mel.forEach((fr, k) => {
        const s = Math.round((t0 + k * 2 * beat + beat * 0.5) * SR);
        for (let i = 0; i < SR * 1.2 && s + i < o.length; i++) {
          const t = i / SR;
          o[s + i] += (Math.sin(2 * Math.PI * fr * 2 * t) + 0.3 * Math.sin(2 * Math.PI * fr * 4 * t)) * env(t, 0.003, 0.3) * 0.12;
        }
      });
    }
  }
  return o;
};

mkdirSync(join(ROOT, "effects"), { recursive: true });
mkdirSync(join(ROOT, "music"), { recursive: true });
for (const [name, gen] of Object.entries(fx)) writeWav(join(ROOT, "effects", `${name}.wav`), gen());
writeWav(join(ROOT, "music", "tema-escuela.wav"), music());
