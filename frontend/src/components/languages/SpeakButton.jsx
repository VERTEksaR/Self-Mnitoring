import { Volume2 } from 'lucide-react';

export function SpeakButton({ text, speech, size = 14 }) {
    if (!speech?.canSpeak) return null;

    return (
        <button type="button" className="btn btn-ghost btn-icon btn-sm" title="Произнести"
            onClick={(e) => { e.stopPropagation(); speech.speak(text); }}>
            <Volume2 size={size} />
        </button>
    );
}