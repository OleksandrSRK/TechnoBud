import { useNavigate } from 'react-router-dom'
import type { Order, Filters } from '../../../types/admin'
import FilterRow from '../FilterRow'

type Props = {
    orders: Order[]
    filters: Filters
    onFilterChange: (col: string, value: string) => void
    onStatusChange: (id: number, status: string) => void
}

export default function OrdersTable({ orders, filters, onFilterChange, onStatusChange }: Props) {
    const navigate = useNavigate()

    return (
        <table>
            <thead>
            <tr><th>ID</th><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            <FilterRow columns={['id','orderNumber','customerName','','','']} filters={filters} onFilterChange={onFilterChange} />
            </thead>
            <tbody>
            {orders.map(o => (
                <tr
                    key={o.id}
                    className={`order-row status-${o.status.toLowerCase()}`}
                    onClick={() => navigate(`/orders/${o.id}`)}
                    style={{ cursor: 'pointer' }}
                >
                    <td>{o.id}</td>
                    <td>{o.orderNumber}</td>
                    <td>{o.customerName}</td>
                    <td>{o.totalAmount} UAH</td>
                    <td>{o.status}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                        <select
                            value={o.status}
                            onChange={e => onStatusChange(o.id, e.target.value)}
                            onClick={e => e.stopPropagation()}
                        >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELED">Canceled</option>
                        </select>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}