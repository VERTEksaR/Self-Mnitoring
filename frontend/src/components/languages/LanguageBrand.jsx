import {Languages} from 'lucide-react';

export function LanguageBrand() {
    return <span className="ln-brand"><img src="/images/sm-logo.png" alt="" /><span>Self-Monitoring</span></span>;
}

export function LanguageBadge({language}) {
    const flag = language.code?.toLowerCase().startsWith('de') ? '/images/flags/flag-de.svg' : null;
    return <span className="ln-language-badge" aria-hidden="true">
        {flag ? <img src={flag} alt="" /> : <Languages size={28} />}
    </span>;
}
