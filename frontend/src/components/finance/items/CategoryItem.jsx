export function CategoryItem({ category, onClick, isSelected }) {
    return (
        <div
            onClick={onClick}
            className={`entity-chip${isSelected ? ' entity-chip--selected' : ''}`}
        >
            {category.name}
        </div>
    );
}
