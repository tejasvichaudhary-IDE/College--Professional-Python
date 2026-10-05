let lastKey = "";
let armed = false;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const female = /female|woman|zira|samantha|victoria|susan|karen|moira|fiona|tessa|serena|hazel|libby|sonia|kathy|veena/i;
  const male = /david|male|daniel|alex|fred|george|rishi/i;
  return (
    english.find((voice) => female.test(`${voice.name} ${voice.voiceURI}`)) ??
    english.find((voice) => !male.test(`${voice.name} ${voice.voiceURI}`)) ??
    english[0] ??
    voices[0] ??
    null
  );
}

export function ensureVoices(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

export function armSpeech(): void {
  armed = true;
}

export function silence(): void {
  window.speechSynthesis?.cancel();
}

export function resetSpeech(): void {
  lastKey = "";
  silence();
}

export function consumeUtterance(key: string): void {
  lastKey = key;
}

function utter(text: string): void {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.96;
  utterance.pitch = 1.04;
  const voice = pickVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "en-US";
  }
  synth.speak(utterance);
}

export function speak(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    const start = () => {
      utter(text);
    };
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
      start();
    };
    window.speechSynthesis.getVoices();
    return;
  }
  utter(text);
}

export function speakAuto(key: string, text: string): void {
  if (!armed || lastKey === key) return;
  lastKey = key;
  speak(text);
}

export function speechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
