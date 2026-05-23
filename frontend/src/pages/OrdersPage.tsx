import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Package } from 'lucide-react'
import '../styles/OrdersPage.css'
import { API_BASE } from '../api'

const API = API_BASE

type Order = {
    id: number
    orderNumber: string
    status: string
    totalAmount: number
    createdAt: string
    items: { id: number; quantity: number }[]
}

export default function OrdersPage() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        fetch(`${API}/orders/my`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => setOrders(data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [token, navigate])

    if (loading) return <div className="orders-page-loading">Loading...</div>

    return (
        <div className="orders-page">
            <main className="orders-main">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ChevronLeft size={18} /> Back
                </button>
                <h2>My Orders ({orders.length})</h2>

                {orders.length === 0 ? (
                    <div className="orders-empty">
                        <Package size={48} />
                        <p>You have no orders yet</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => (
                            <div
                                key={order.id}
                                className="order-card"
                                onClick={() => navigate(`/orders/${order.id}`)}
                            >
                                <div className="order-card-header">
                                    <span className="order-number">{order.orderNumber}</span>
                                    <span className={`order-status status-${order.status.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="order-card-body">
                                    <div className="order-meta">
                                        {new Date(order.createdAt).toLocaleDateString('uk-UA', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                    <div className="order-items-count">
                                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                    </div>
                                    <div className="order-total">
                                        {order.totalAmount.toLocaleString('uk-UA')} ₴
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}