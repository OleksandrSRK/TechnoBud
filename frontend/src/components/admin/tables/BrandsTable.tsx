import type { Brand, Filters } from '../../../types/admin'
import FilterRow from '../FilterRow'

type Props = {
    brands: Brand[]
    filters: Filters
    onFilterChange: (col: string, value: string) => void
    onEdit: (brand: Brand) => void
    onToggleActive: (id: number, current: boolean) => void
    onDelete: (id: number) => void
}

export default function BrandsTable({ brands, filters, onFilterChange, onEdit, onToggleActive, onDelete }: Props) {
    return (
        <table>
            <thead>
            <tr>
                <th>ID</th>
                <th>Logo</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Website</th>
                <th>Active</th>
                <th>Actions</th>
            </tr>
            <FilterRow columns={['id','','name','slug','','','']} filters={filters} onFilterChange={onFilterChange} />
            </thead>
            <tbody>
            {brands.map(b => (
                <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.logoUrl ? <img src={b.logoUrl} alt={b.name} className="admin-product-thumb" /> : '—'}</td>
                    <td>{b.name}</td>
                    <td>{b.slug}</td>
                    <td>{b.description?.substring(0, 50) ?? '—'}</td>
                    <td>
                        {b.websiteUrl ? (
                            <a href={b.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1e88e5' }}>
                                {new URL(b.websiteUrl).hostname}
                            </a>
                        ) : '—'}
                    </td>
                    <td>{b.isActive ? 'Yes' : 'No'}</td>
                    <td>
                        <button className="admin-btn-edit" onClick={() => onEdit(b)}>Edit</button>
                        <button className="admin-btn-toggle" onClick={() => onToggleActive(b.id, b.isActive)}>
                            {b.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="admin-btn-delete" onClick={() => onDelete(b.id)}>Delete</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}