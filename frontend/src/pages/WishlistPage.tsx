import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/products/ProductCard'
import '../styles/WishlistPage.css'

const API = 'http://localhost:3000'

type ViewProduct = {
    id: number
    name: string
    price: number
    oldPrice?: number | null
    currency: string
    category: string
    categorySlug: string
    brand: string
    brandSlug: string
    imageUrl?: string | null
    rating: number
    reviewCount: number
    stock: number
    images?: any[]
    isActive?: boolean
}

export default function WishlistPage() {
    const navigate = useNavigate()
    const [products, setProducts] = useState<ViewProduct[]>([])
    const [loading, setLoading] = useState(true)

    const token = localStorage.getItem('token')

    const loadWishlist = async () => {
        if (!token) {
            navigate('/login')
            return
        }
        try {
            const res = await fetch(`${API}/wishlist`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                const mapped: ViewProduct[] = data
                    .filter((p: any) => p.isActive !== false)
                    .map((p: any) => {
                        const mainImg = p.images?.find((img: any) => img.isMain) || p.images?.[0]
                        return {
                            id: p.id,
                            name: p.name,
                            price: Number(p.price),
                            oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
                            currency: p.currency || 'UAH',
                            category: p.category?.name || '',
                            categorySlug: p.category?.slug || '',
                            brand: p.brand?.name || '',
                            brandSlug: p.brand?.slug || '',
                            imageUrl: mainImg?.url || null,
                            rating: p.rating || 0,
                            reviewCount: p.reviewCount || 0,
                            stock: p.stock || 0,
                            images: p.images || [],
                            isActive: p.isActive,
                        }
                    })
                setProducts(mapped)
            }
        } catch (err) {
            console.error('Failed to load wishlist', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadWishlist()
    }, [])

    const handleToggleWishlist = async (productId: number) => {
        if (!token) return
        await fetch(`${API}/wishlist/${productId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        })
        setProducts(prev => prev.filter(p => p.id !== productId))
        window.dispatchEvent(new Event('wishlistUpdated'))
    }

    const handleAddAllToCart = async () => {
        if (!token) return
        for (const product of products) {
            try {
                await fetch(`${API}/cart/${product.id}`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ quantity: 1 }),
                })
            } catch (err) {
                console.error(`Failed to add product ${product.id} to cart`, err)
            }
        }
        window.dispatchEvent(new Event('cartUpdated'))
        navigate('/cart')
    }

    const totalPrice = products
        .filter(p => p.stock > 0)
        .reduce((sum, p) => sum + p.price, 0)

    if (loading) return <div className="wishlist-page-loading">Loading...</div>

    return (
        <div className="wishlist-page">
            <main className="wishlist-main">
                <div className="wishlist-header">
                    <h2>My Wishlist ({products.length})</h2>
                    <button className="wishlist-back-btn" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                </div>

                {products.length > 0 && (
                    <div className="wishlist-actions">
                        <div className="wishlist-total">
                            <strong>Total:</strong> <strong>{totalPrice.toLocaleString('uk-UA')} ₴</strong>
                        </div>
                        <button className="wishlist-add-all-btn" onClick={handleAddAllToCart}>
                            Add all to cart
                        </button>
                    </div>
                )}

                {products.length === 0 ? (
                    <p className="wishlist-empty">Your wishlist is empty.</p>
                ) : (
                    <div className="wishlist-grid">
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isWishlisted={true}
                                onToggleWishlist={handleToggleWishlist}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}