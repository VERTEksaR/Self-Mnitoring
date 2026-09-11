import { useState } from "react";
import { AccountItem } from "../AccountItem.jsx";
import { EmptyHint } from "../EmptyHint.jsx";
import { SECTION_LIMIT } from "../../utils/finance.ts";


export function AccountsPanel({ accounts, selectedAccount, onSelect, onAdd }) {
    const [accExpanded, setAccExpanded] = useState(false);
    const visibleAccounts = accExpanded ? accounts : accounts.slice(0, SECTION_LIMIT);

    return (
        <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>Счета</span>
                <span className="section-count">{accounts.length}</span>
            </div>
            {accounts.length === 0 ? (
                <EmptyHint
                    title="Нет счетов"
                    hint="Счёт — это карта, наличные или кошелёк. Добавьте хотя бы один."
                    action="+ Создать счёт"
                    onAction={onAdd}
                />
            ) : (
                <div style={{ padding: '10px 12px' }}>
                    <div className="entity-grid">
                        {visibleAccounts.map(a => (
                            <AccountItem key={a.id} account={a}
                                onClick={() => onSelect(a)}
                                isSelected={selectedAccount?.id === a.id} />
                        ))}
                    </div>
                    {accounts.length > SECTION_LIMIT && (
                        <button onClick={() => setAccExpanded(x => !x)} style={{
                            marginTop: 8, padding: '4px 12px', borderRadius: 6,
                            border: '1px solid var(--border)', background: 'var(--surface-sunken)',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            color: 'var(--text-muted)', fontFamily: 'inherit',
                        }}>
                            {accExpanded ? 'Свернуть' : `Ещё ${accounts.length - SECTION_LIMIT}`}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}