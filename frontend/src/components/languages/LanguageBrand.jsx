import {Languages} from 'lucide-react';
import {getLanguageFlag} from '../../utils/languageFlags.js';

export function LanguageBrand() {
    return <span className="ln-brand"><img src="/images/sm-logo.png" alt="" /><span>Self-Monitoring</span></span>;
}

export function LanguageBadge({language}) {
    const flag = getLanguageFlag(language.code);
    return <span className="ln-language-badge" aria-hidden="true">
        {flag ? <img src={flag} alt="" /> : <Languages size={28} />}
    </span>;
}
