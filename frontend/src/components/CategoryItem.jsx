export function CategoryItem ({ category, onClick, isSelected }) {
    return (
        <div onClick={onClick} style={{
            border: isSelected ? "2px solid #4f46e5" : "1px solid #ccc",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "8px",
            cursor: "pointer",
            backgroundColor: isSelected ? "#eef2ff" : "#fff",
        }}>
            <div>
                {category.name}
            </div>
        </div>
    )
}