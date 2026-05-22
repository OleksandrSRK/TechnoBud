import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Trash2 } from 'lucide-react'
import '../styles/CartPage.css'

const API = 'http://localhost:3000'

type CartItem = {
    cartItemId: number
    product: any
    quantity: number
}

export default function CartPage() {
    const navigate = useNavigate()
    const [items, setItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem('token')

    const loadCart = async () => {
        if (!token) {
            navigate('/login')
            return
        }
        try {
            const res = await fetch(`${API}/cart`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setItems(data.items)
            }
        } catch (err) {
            console.error('Failed to load cart', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCart()
    }, [])

    const handleUpdateQuantity = async (itemId: number, quantity: number) => {
        if (quantity < 1) return
        await fetch(`${API}/cart/${itemId}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity }),
        })
        setItems(prev => prev.map(item =>
            item.cartItemId === itemId ? { ...item, quantity } : item
        ))
        window.dispatchEvent(new Event('cartUpdated'))
    }

    const handleRemove = async (itemId: number) => {
        await fetch(`${API}/cart/${itemId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        })
        setItems(prev => prev.filter(item => item.cartItemId !== itemId))
        window.dispatchEvent(new Event('cartUpdated'))
    }

    const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)

    if (loading) return <div className="cart-loading">Loading...</div>

    return (
        <div className="cart-page">
            <main className="cart-main">
                <div className="cart-header">
                    <button className="cart-back-btn" onClick={() => navigate(-1)}>
                        <ChevronLeft size={18} /> Back
                    </button>
                    <h2>Shopping Cart ({items.length})</h2>
                </div>

                {items.length === 0 ? (
                    <p className="cart-empty">Your cart is empty.</p>
                ) : (
                    <div className="cart-content">
                        <div className="cart-items">
                            {items.map(item => (
                                <div key={item.cartItemId} className="cart-item">
                                    <img
                                        src={item.product.images?.[0]?.url || '/placeholder.png'}
                                        alt={item.product.name}
                                        className="cart-item-image"
                                    />
                                    <div className="cart-item-info">
                                        <h3>{item.product.name}</h3>
                                        <p>{Number(item.product.price).toLocaleString()} ₴</p>
                                    </div>
                                    <div className="cart-item-actions">
                                        <div className="cart-quantity">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                −
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button className="cart-remove-btn" onClick={() => handleRemove(item.cartItemId)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <div className="cart-total">
                                Total: <strong>{total.toLocaleString('uk-UA')} ₴</strong>
                            </div>
                            <button
                                className="cart-order-btn"
                                onClick={() => navigate('/order')}
                            >
                                Order
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}