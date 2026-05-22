import type { User, Filters } from '../../../types/admin'
import FilterRow from '../FilterRow'

type Props = {
    users: User[]
    filters: Filters
    onFilterChange: (col: string, value: string) => void
    onEdit: (user: User) => void
    onToggleActive: (id: number, current: boolean) => void
    onDelete: (id: number) => void
}

export default function UsersTable({ users, filters, onFilterChange, onEdit, onToggleActive, onDelete }: Props) {
    return (
        <table>
            <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Active</th><th>Created</th><th>Actions</th></tr>
            <FilterRow columns={['id','fullName','email','phone','role','','']} filters={filters} onFilterChange={onFilterChange} />
            </thead>
            <tbody>
            {users.map(u => (
                <tr key={u.id}>
                    <td>{u.id}</td><td>{u.fullName}</td><td>{u.email}</td><td>{u.phone || '—'}</td>
                    <td>{u.role}</td><td>{u.isActive ? 'Yes' : 'No'}</td><td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button className="admin-btn-edit" onClick={() => onEdit(u)}>Edit</button>
                        <button className="admin-btn-toggle" onClick={() => onToggleActive(u.id, u.isActive)}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="admin-btn-delete" onClick={() => onDelete(u.id)}>Delete</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}