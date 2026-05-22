import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Package, MapPin, Phone, Mail, User } from 'lucide-react'
import '../styles/OrderDetailPage.css'

const API = 'http://localhost:3000'

type OrderData = {
    id: number
    orderNumber: string
    status: string
    customerName: string
    customerPhone: string
    customerEmail: string
    shippingAddress: string
    subtotal: number
    totalAmount: number
    discountAmount: number
    shippingAmount: number
    notes?: string
    createdAt: string
    items: {
        id: number
        quantity: number
        unitPrice: number
        totalPrice: number
        productNameSnapshot: string
        brandNameSnapshot?: string
        skuSnapshot?: string
        product?: {
            id: number
            images: { url: string; alt?: string }[]
        }
    }[]
    user?: { id: number; fullName: string; email: string }
    address?: { city: string; street: string; house: string; apartment?: string }
}

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [order, setOrder] = useState<OrderData | null>(null)
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        const loadOrder = async () => {
            try {
                const res = await fetch(`${API}/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (!res.ok) {
                    const data = await res.json().catch(() => null)
                    throw new Error(data?.message || 'Order not found')
                }
                const data: OrderData = await res.json()
                setOrder(data)
            } catch (err: any) {
                console.error(err)
                alert(err.message || 'Failed to load order')
                navigate('/orders')
            } finally {
                setLoading(false)
            }
        }
        loadOrder()
    }, [id, token, navigate])

    if (loading) return <div className="order-detail-loading">Loading...</div>
    if (!order) return null

    const statusSteps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
    const currentStep = statusSteps.indexOf(order.status)

    return (
        <div className="order-detail-page">
            <main className="order-detail-main">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ChevronLeft size={18} /> Back to orders
                </button>

                <div className="order-header">
                    <h2>Order #{order.orderNumber}</h2>
                    <span className={`order-status status-${order.status.toLowerCase()}`}>
                        {order.status}
                    </span>
                </div>

                {}
                <div className="order-progress">
                    {statusSteps.map((step, idx) => (
                        <div
                            key={step}
                            className={`progress-step ${idx <= currentStep ? 'active' : ''} ${order.status === 'CANCELED' ? 'canceled' : ''}`}
                        >
                            <div className="step-circle">{idx + 1}</div>
                            <div className="step-label">{step}</div>
                        </div>
                    ))}
                    {order.status === 'CANCELED' && (
                        <div className="progress-step canceled active">
                            <div className="step-circle">✕</div>
                            <div className="step-label">Canceled</div>
                        </div>
                    )}
                </div>

                <div className="order-details-grid">
                    {}
                    <div className="detail-card">
                        <h3><User size={18} /> Customer</h3>
                        <p>{order.customerName}</p>
                        <p><Phone size={14} /> {order.customerPhone}</p>
                        <p><Mail size={14} /> {order.customerEmail}</p>
                    </div>

                    <div className="detail-card">
                        <h3><MapPin size={18} /> Shipping Address</h3>
                        <p>{order.shippingAddress}</p>
                    </div>

                    <div className="detail-card">
                        <h3><Package size={18} /> Summary</h3>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{order.subtotal.toLocaleString()} ₴</span>
                        </div>
                        {order.discountAmount > 0 && (
                            <div className="summary-row">
                                <span>Discount</span>
                                <span>-{order.discountAmount.toLocaleString()} ₴</span>
                            </div>
                        )}
                        {order.shippingAmount > 0 && (
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>{order.shippingAmount.toLocaleString()} ₴</span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>{order.totalAmount.toLocaleString()} ₴</span>
                        </div>
                    </div>
                </div>

                {}
                <div className="order-items">
                    <h3>Items ({order.items.length})</h3>
                    {order.items.map(item => {
                        const imgUrl = item.product?.images?.[0]?.url || '/placeholder.png'
                        return (
                            <div key={item.id} className="order-item-row">
                                <img src={imgUrl} alt={item.productNameSnapshot} className="order-item-img" />
                                <div className="order-item-info">
                                    <div className="order-item-name">{item.productNameSnapshot}</div>
                                    {item.brandNameSnapshot && (
                                        <div className="order-item-brand">{item.brandNameSnapshot}</div>
                                    )}
                                    <div className="order-item-price">
                                        {item.quantity} × {Number(item.unitPrice).toLocaleString()} ₴
                                    </div>
                                </div>
                                <div className="order-item-total">
                                    {Number(item.totalPrice).toLocaleString()} ₴
                                </div>
                            </div>
                        )
                    })}
                </div>

                {order.notes && (
                    <div className="order-notes">
                        <h3>Notes</h3>
                        <p>{order.notes}</p>
                    </div>
                )}
            </main>
        </div>
    )
}