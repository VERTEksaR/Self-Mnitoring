import { useCallback, useEffect, useState } from 'react';

const synth = window.speechSynthesis;

function pickVoice(voices, code) {
    if (!code) return null;

    const norm = (s) => s.toLowerCase().replace('_', '-');
    const want = norm(code);
    const base = want.split('-')[0];
    return voices.find(v => norm(v.lang) === want)
        ?? voices.find(v => norm(v.lang).split('-')[0] === base)
        ?? null;
}

export function useSpeech(code) {
    const [voices, setVoices] = useState(() => synth?.getVoices() ?? []);

    useEffect(() => {
        if (!synth) return;

        const update = () => setVoices(synth.getVoices());
        update();
        synth.addEventListener('voiceschanged', update);
        return () => synth.removeEventListener('voiceschanged', update);
    }, []);

    const voice = pickVoice(voices, code);
    const speak = useCallback((text) => {
        if (!voice || !text) return;

        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.lang = voice.lang;
        utterance.rate = 0.9;
        synth.speak(utterance);
    }, [voice]);

    return { canSpeak: !!voice, speak };
}