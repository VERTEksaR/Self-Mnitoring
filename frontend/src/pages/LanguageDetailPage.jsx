import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Languages } from 'lucide-react';
import { EmptyHint } from '../components/EmptyHint';

// Заглушка: страница языка с вкладками «Словарь» и «Конспекты» — этап 2 в docs/languages-roadmap.md
export default function LanguageDetailPage() {
    const { languageId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="finance-page">
            <nav className="finance-nav">
                <div className="finance-nav-group">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/learn')} aria-label="Назад">
                        <ArrowLeft size={15} />
                    </button>
                    <span className="finance-nav-brand">
                        <Languages size={18} />
                        <span>Язык #{languageId}</span>
                    </span>
                </div>
            </nav>

            <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 20px' }}>
                <EmptyHint title="Раздел в разработке" hint="Здесь будут вкладки «Словарь» и «Конспекты»" />
            </div>
        </div>
    );
}
