import type { Product, Filters } from '../../../types/admin'
import FilterRow from '../FilterRow'

type Props = {
    products: Product[]
    filters: Filters
    onFilterChange: (col: string, value: string) => void
    onEdit: (product: Product) => void
    onToggleActive: (id: number, current: boolean) => void
    onDelete: (id: number) => void
}

export default function ProductsTable({ products, filters, onFilterChange, onEdit, onToggleActive, onDelete }: Props) {
    return (
        <table>
            <thead>
            <tr><th>ID</th><th>Image</th><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Category</th><th>Brand</th><th>Active</th><th>Actions</th></tr>
            <FilterRow columns={['id','','name','sku','','','','','']} filters={filters} onFilterChange={onFilterChange} />
            </thead>
            <tbody>
            {products.map(p => {
                const mainImg = p.images?.find(i => i.isMain) || p.images?.[0]
                return (
                    <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{mainImg ? <img src={mainImg.url} alt={mainImg.alt || p.name} className="admin-product-thumb" /> : '—'}</td>
                        <td>{p.name}</td><td>{p.sku}</td><td>{p.price} {p.currency}</td><td>{p.stock}</td>
                        <td>{p.category?.name || p.categoryId}</td><td>{p.brand?.name || p.brandId}</td>
                        <td>{p.isActive ? 'Yes' : 'No'}</td>
                        <td>
                            <button className="admin-btn-edit" onClick={() => onEdit(p)}>Edit</button>
                            <button className="admin-btn-toggle" onClick={() => onToggleActive(p.id, p.isActive)}>
                                {p.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="admin-btn-delete" onClick={() => onDelete(p.id)}>Delete</button>
                        </td>
                    </tr>
                )
            })}
            </tbody>
        </table>
    )
}