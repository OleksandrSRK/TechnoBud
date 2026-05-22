type Props = {
    title: string
    showAdd?: boolean
    onAdd: () => void
}

export default function AdminToolbar({ title, showAdd = true, onAdd }: Props) {
    return (
        <div className="admin-toolbar">
            <h2>{title}</h2>
            <div className="admin-toolbar-right">
                {showAdd && <button onClick={onAdd}>+ Add</button>}
            </div>
        </div>
    )
}