import { useCallback, useEffect, useRef, useState } from 'react';

/* La Web Speech API todavía no está en los tipos estándar del DOM.
   Solo declaramos lo que usamos. */
interface SpeechResultItem { transcript: string }
interface SpeechResult { 0: SpeechResultItem; isFinal: boolean; length: number }
interface SpeechEvent { resultIndex: number; results: { length: number } & Record<number, SpeechResult> }
interface SpeechErrorEvent { error: string }

interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechEvent) => void) | null;
  onerror: ((e: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

const MENSAJES: Record<string, string> = {
  'not-allowed': 'No nos diste permiso para usar el micrófono. Activalo en el candado de la barra de direcciones.',
  'service-not-allowed': 'El navegador bloqueó el micrófono. Revisá los permisos del sitio.',
  'no-speech': 'No escuchamos nada. Probá de nuevo, más cerca del micrófono.',
  'audio-capture': 'No encontramos un micrófono conectado.',
  network: 'Se cortó la conexión mientras transcribíamos.',
};

interface Options {
  lang?: string;
  /** Recibe el texto reconocido ya cerrado (frases finales) */
  onFinal: (texto: string) => void;
}

/**
 * Dictado por voz con la API nativa del navegador — sin dependencias ni costo
 * por minuto. Chrome, Edge y Safari la soportan; en Firefox `supported` es
 * false y quien llama simplemente no muestra el botón.
 */
export function useSpeechInput({ lang = 'es-HN', onFinal }: Options) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');
  const recRef = useRef<Recognition | null>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  useEffect(() => { setSupported(getCtor() !== null); }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
    setInterim('');
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;

    setError('');
    const rec = new Ctor();
    rec.lang = lang;
    // continuous: la persona puede hacer pausas sin que se corte el dictado
    rec.continuous = true;
    // interimResults: muestra lo que va escuchando, para que se vea que funciona
    rec.interimResults = true;

    rec.onresult = e => {
      let parcial = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) onFinalRef.current(r[0].transcript.trim());
        else parcial += r[0].transcript;
      }
      setInterim(parcial);
    };

    rec.onerror = e => {
      // `aborted` es lo que dispara nuestro propio stop(): no es un error real
      if (e.error === 'aborted') return;
      setError(MENSAJES[e.error] || 'No pudimos usar el micrófono.');
      setListening(false);
    };

    rec.onend = () => { setListening(false); setInterim(''); };

    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [lang]);

  // Si el componente se desmonta con el micrófono abierto, se queda encendido
  useEffect(() => () => { recRef.current?.abort(); }, []);

  return { supported, listening, interim, error, start, stop, toggle: () => (listening ? stop() : start()) };
}
