import type { Category, Filters } from '../../../types/admin'
import FilterRow from '../FilterRow'

type Props = {
    categories: Category[]
    filters: Filters
    onFilterChange: (col: string, value: string) => void
    onEdit: (category: Category) => void
    onToggleActive: (id: number, current: boolean) => void
    onDelete: (id: number) => void
}

export default function CategoriesTable({ categories, filters, onFilterChange, onEdit, onToggleActive, onDelete }: Props) {
    return (
        <table>
            <thead>
            <tr><th>ID</th><th>Name</th><th>Slug</th><th>Description</th><th>Active</th><th>Actions</th></tr>
            <FilterRow columns={['id','name','slug','','']} filters={filters} onFilterChange={onFilterChange} />
            </thead>
            <tbody>
            {categories.map(c => (
                <tr key={c.id}>
                    <td>{c.id}</td><td>{c.name}</td><td>{c.slug}</td><td>{c.description?.substring(0, 50) ?? '—'}</td>
                    <td>{c.isActive ? 'Yes' : 'No'}</td>
                    <td>
                        <button className="admin-btn-edit" onClick={() => onEdit(c)}>Edit</button>
                        <button className="admin-btn-toggle" onClick={() => onToggleActive(c.id, c.isActive)}>
                            {c.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="admin-btn-delete" onClick={() => onDelete(c.id)}>Delete</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}