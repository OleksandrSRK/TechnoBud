import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Heart, Star } from 'lucide-react'
import './ProductCard.css'

type ProductImage = {
    id?: number
    url: string
    alt?: string | null
    sortOrder?: number
    isMain?: boolean
}

type Product = {
    id: number
    name: string
    price: number
    category: string
    imageUrl?: string | null
    oldPrice?: number | null
    rating?: number | null
    brand?: string | null
    images?: ProductImage[]
    stock: number
}

type Props = {
    product: Product
    isWishlisted?: boolean
    onToggleWishlist?: (productId: number) => void
}

export default function ProductCard({ product, isWishlisted = false, onToggleWishlist }: Props) {
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null') as { id: number; role: 'CUSTOMER' | 'ADMIN' } | null
        } catch {
            return null
        }
    }, [])
    const isAdmin = currentUser?.role === 'ADMIN'

    const images = useMemo(() => {
        const fromApi = product.images?.length ? product.images : []
        if (fromApi.length > 0) {
            return [...fromApi].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        }
        if (product.imageUrl) {
            return [{ url: product.imageUrl, alt: product.name }]
        }
        return []
    }, [product.images, product.imageUrl, product.name])

    const [currentIndex, setCurrentIndex] = useState(0)
    const currentImage = images[currentIndex]

    const goPrev = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (images.length <= 1) return
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const goNext = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (images.length <= 1) return
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const discountPercent =
        product.oldPrice && product.oldPrice > product.price
            ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
            : null

    const isInStock = product.stock > 0

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (isAdmin) return
        if (!token) {
            alert('Please log in to add items to your wishlist.')
            return
        }
        if (onToggleWishlist) {
            onToggleWishlist(product.id)
        }
    }

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (isAdmin) return
        if (!token) {
            alert('Please log in to add items to cart.')
            return
        }
        try {
            await fetch(`http://localhost:3000/cart/${product.id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: 1 }),
            })
            window.dispatchEvent(new Event('cartUpdated'))
        } catch {}
    }

    return (
        <article
            className="tb-card"
            onClick={() => navigate(`/product/${product.id}`)}
            style={{ cursor: 'pointer' }}
        >
            <div className={`tb-card-image ${!isInStock ? 'tb-card-image--out' : ''}`}>
                {product.category && <div className="tb-card-chip">{product.category}</div>}

                {currentImage ? (
                    <img
                        className="tb-card-photo"
                        src={currentImage.url}
                        alt={currentImage.alt || product.name}
                    />
                ) : (
                    <div className="tb-image-placeholder">No image available</div>
                )}

                {images.length > 1 && (
                    <>
                        <div className="tb-img-nav-overlay">
                            <button type="button" className="tb-img-nav tb-img-nav-left" onClick={goPrev} aria-label="Previous image">
                                <ChevronLeft size={18} />
                            </button>
                            <button type="button" className="tb-img-nav tb-img-nav-right" onClick={goNext} aria-label="Next image">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        <div className="tb-img-dots">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`tb-img-dot ${index === currentIndex ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setCurrentIndex(index)
                                    }}
                                    aria-label={`Go to image ${index + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="tb-card-body">
                <h3 className="tb-card-title">{product.name}</h3>
                {product.brand && <div className="tb-brand-line">{product.brand}</div>}

                <div className="tb-rating">
                    <Star size={14} />
                    {product.rating?.toFixed(1) ?? '4.8'}
                </div>

                <div className="tb-prices">
                    <div className={`tb-price ${!isInStock ? 'tb-price--muted' : ''}`}>
                        {product.price.toLocaleString('uk-UA')} ₴
                    </div>
                    {isInStock && product.oldPrice && (
                        <>
                            <div className="tb-old-price">
                                {product.oldPrice.toLocaleString('uk-UA')} ₴
                            </div>
                            {discountPercent && (
                                <span className="tb-discount-badge">-{discountPercent}%</span>
                            )}
                        </>
                    )}
                </div>

                <div className="tb-card-footer">
                    {isInStock ? (
                        <button
                            type="button"
                            className="tb-buy-btn"
                            onClick={handleAddToCart}
                            disabled={isAdmin}
                        >
                            Add to cart
                        </button>
                    ) : (
                        <div className="tb-out-of-stock">Out of stock</div>
                    )}
                    <button
                        type="button"
                        className={`tb-fav-btn ${isWishlisted ? 'tb-fav-btn--active' : ''}`}
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        onClick={handleWishlistClick}
                        disabled={isAdmin}
                    >
                        <Heart size={16} fill={isWishlisted ? '#e53935' : 'none'} color={isWishlisted ? '#e53935' : '#999'} />
                    </button>
                </div>
            </div>
        </article>
    )
}