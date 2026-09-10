import { useState } from "react";
import { CategoryItem } from "../CategoryItem.jsx";
import { EmptyHint } from "../EmptyHint.jsx";
import { SECTION_LIMIT } from "../../utils/finance.ts";


export function CategoriesPanel({ categories, selectedCategory, onSelect, onAdd }) {
    const [catExpanded, setCatExpanded] = useState(false);
    const visibleCategories = catExpanded ? categories : categories.slice(0, SECTION_LIMIT);

    return (
        <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>Категории</span>
                <span className="section-count">{categories.length}</span>
            </div>
            {categories.length === 0 ? (
                <EmptyHint
                    title="Нет категорий"
                    hint="Категории нужны для классификации транзакций. Без них нельзя добавить операцию."
                    action="+ Создать категорию"
                    onAction={onAdd}
                />
            ) : (
                <div style={{ padding: '10px 12px' }}>
                    <div className="entity-grid">
                        {visibleCategories.map(c => (
                            <CategoryItem key={c.id} category={c}
                                onClick={() => onSelect(c)}
                                isSelected={selectedCategory?.id === c.id} />
                        ))}
                    </div>
                    {categories.length > SECTION_LIMIT && (
                        <button onClick={() => setCatExpanded(x => !x)} style={{
                            marginTop: 8, padding: '4px 12px', borderRadius: 6,
                            border: '1px solid var(--border)', background: 'var(--surface-sunken)',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            color: 'var(--text-muted)', fontFamily: 'inherit',
                        }}>
                            {catExpanded ? 'Свернуть' : `Ещё ${categories.length - SECTION_LIMIT}`}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}