/**
 * Som de notificação do app — sinal sutil, não alarme.
 *
 * Sintetizado via WebAudio (sem MP3): zero asset novo e controle total do
 * envelope pra manter o toque discreto.
 * Navegadores bloqueiam áudio até um gesto do usuário: `primeSom()` deve ser
 * chamado no primeiro pointerdown/keydown da sessão pra destravar o contexto.
 */

let ctx: AudioContext | null = null;
let muted = false;
let ultimoToque = 0;

const INTERVALO_MIN_MS = 3000; // rajada de eventos = um toque só

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      ctx = null;
    }
  }
  return ctx;
}

/** Destrava o áudio num gesto do usuário (autoplay policy). */
export function primeSom() {
  const c = getCtx();
  if (c && c.state === "suspended") void c.resume();
}

export function setMutedSom(v: boolean) {
  muted = v;
}

/**
 * Dois toques senoidais curtos e baixos ("din-din" ascendente, ~0,3s).
 * Se o contexto ainda está travado (nenhum gesto na sessão), sai mudo sem erro.
 */
export function tocarNotificacao() {
  if (muted) return;
  const agora = Date.now();
  if (agora - ultimoToque < INTERVALO_MIN_MS) return;

  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") {
    void c.resume(); // tenta; fora de gesto o navegador ignora
    return;
  }
  ultimoToque = agora;

  const t0 = c.currentTime;
  const notas = [
    { freq: 659, at: 0, dur: 0.14, pico: 0.055 }, // E5
    { freq: 880, at: 0.11, dur: 0.22, pico: 0.05 }, // A5
  ];
  for (const n of notas) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = n.freq;
    osc.connect(gain);
    gain.connect(c.destination);
    const ini = t0 + n.at;
    gain.gain.setValueAtTime(0.0001, ini);
    gain.gain.exponentialRampToValueAtTime(n.pico, ini + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, ini + n.dur);
    osc.start(ini);
    osc.stop(ini + n.dur + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
}
