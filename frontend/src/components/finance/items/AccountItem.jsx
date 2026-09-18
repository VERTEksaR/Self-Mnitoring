export function AccountItem({ account, onClick, isSelected }) {
    return (
        <div
            onClick={onClick}
            className={`entity-chip${isSelected ? ' entity-chip--selected' : ''}`}
        >
            {account.name}
        </div>
    );
}
