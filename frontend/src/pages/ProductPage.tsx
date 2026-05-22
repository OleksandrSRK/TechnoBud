import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import '../styles/ProductPage.css'

const API = 'http://localhost:3000'

type ProductData = {
    id: number
    name: string
    sku: string
    slug: string
    shortDescription?: string | null
    description: string
    price: number
    oldPrice?: number | null
    currency: string
    stock: number
    rating: number
    reviewCount: number
    warrantyMonths?: number | null
    powerW?: number | null
    energyClass?: string | null
    color?: string | null
    material?: string | null
    weightKg?: number | null
    isActive: boolean
    category: { id: number; name: string; slug: string }
    brand: { id: number; name: string; slug: string }
    images: { id: number; url: string; alt?: string | null; isMain: boolean; sortOrder: number }[]
    specifications: { id: number; name: string; value: string; unit?: string | null }[]
}

export default function ProductPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [product, setProduct] = useState<ProductData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tab, setTab] = useState<'about' | 'specs' | 'reviews'>('about')
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const [isWishlisted, setIsWishlisted] = useState(false)
    const token = localStorage.getItem('token')

    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null') as { id: number; role: 'CUSTOMER' | 'ADMIN' } | null
        } catch {
            return null
        }
    }, [])
    const isAdmin = currentUser?.role === 'ADMIN'

    const checkWishlist = async () => {
        if (isAdmin || !token || !id) return
        try {
            const res = await fetch(`${API}/wishlist`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setIsWishlisted(data.some((p: any) => p.id === Number(id)))
            }
        } catch {}
    }

    const handleToggleWishlist = async () => {
        if (isAdmin) return
        if (!token) return alert('Please log in to add items to your wishlist.')
        const method = isWishlisted ? 'DELETE' : 'POST'
        try {
            const res = await fetch(`${API}/wishlist/${id}`, {
                method,
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                setIsWishlisted(!isWishlisted)
                window.dispatchEvent(new Event('wishlistUpdated'))
            }
        } catch {}
    }

    const handleAddToCart = async () => {
        if (isAdmin) return
        if (!token) {
            alert('Please log in to add items to cart.')
            return
        }
        try {
            await fetch(`${API}/cart/${id}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity: 1 }),
            })
            window.dispatchEvent(new Event('cartUpdated'))
        } catch {
            alert('Failed to add to cart')
        }
    }

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setError(null)
                const res = await fetch(`${API}/products/${id}`)
                if (!res.ok) {
                    const data = await res.json().catch(() => null)
                    throw new Error(data?.message || 'Product not found')
                }
                const data: ProductData = await res.json()
                setProduct(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        loadProduct()
        if (!isAdmin) checkWishlist()
    }, [id])

    const [reviews, setReviews] = useState<any[]>([])
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '', parentId: null as number | null })
    const [submitting, setSubmitting] = useState(false)
    const [userHasReviewed, setUserHasReviewed] = useState(false)

    const loadReviews = async () => {
        try {
            const res = await fetch(`${API}/reviews/${id}`)
            if (res.ok) {
                const data = await res.json()
                setReviews(data)
                if (currentUser) {
                    const already = data.some((r: any) =>
                        r.userId === currentUser.id && !r.parentId
                    )
                    setUserHasReviewed(already)
                }
            }
        } catch (err) {
            console.error('Failed to load reviews', err)
        }
    }

    useEffect(() => {
        if (id) loadReviews()
    }, [id])

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return alert('Please log in to leave a review')
        setSubmitting(true)
        try {
            const res = await fetch(`${API}/reviews/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(reviewForm),
            })
            if (res.ok) {
                setReviewForm({ rating: 5, title: '', comment: '', parentId: null })
                loadReviews()
            } else {
                const data = await res.json()
                alert(data.message || 'Failed to submit review')
            }
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    const startReply = (parentId: number) => {
        setReviewForm({ rating: 5, title: '', comment: '', parentId })
    }

    const cancelReply = () => {
        setReviewForm({ rating: 5, title: '', comment: '', parentId: null })
    }

    const showNewReviewForm = !reviewForm.parentId && !!token && currentUser?.role !== 'ADMIN' && !userHasReviewed

    if (loading) return <div className="product-page-loading">Loading...</div>
    if (error || !product) return <div className="product-page-loading">{error || 'Product not found'}</div>

    const images = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)
    const currentImage = images.length > 0 ? images[currentImageIndex] : null

    const goNext = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (images.length <= 1) return
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }

    const goPrev = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (images.length <= 1) return
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const discountPercent =
        product.oldPrice && product.oldPrice > product.price
            ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
            : null

    return (
        <div className="product-page">
            <main className="product-main">
                <button className="product-back-btn" onClick={() => navigate(-1)}>
                    <ChevronLeft size={18} /> Back
                </button>

                <div className="product-tabs">
                    <button className={`product-tab ${tab === 'about' ? 'active' : ''}`} onClick={() => setTab('about')}>About</button>
                    <button className={`product-tab ${tab === 'specs' ? 'active' : ''}`} onClick={() => setTab('specs')}>Specifications</button>
                    <button className={`product-tab ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>
                        Reviews ({product.reviewCount})
                    </button>
                </div>

                <div className="product-content">
                    {tab === 'about' && (
                        <div className="product-about">
                            <div className="product-card product-gallery-card">
                                <div className="product-gallery">
                                    <div className="product-main-image">
                                        {currentImage ? (
                                            <img
                                                src={currentImage.url}
                                                alt={currentImage.alt || product.name}
                                            />
                                        ) : (
                                            <div className="product-no-image">No image</div>
                                        )}

                                        {images.length > 1 && (
                                            <>
                                                <div className="product-img-nav-overlay">
                                                    <button
                                                        type="button"
                                                        className="product-img-nav product-img-nav-left"
                                                        onClick={goPrev}
                                                    >
                                                        <ChevronLeft size={18} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="product-img-nav product-img-nav-right"
                                                        onClick={goNext}
                                                    >
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                                <div className="product-img-dots">
                                                    {images.map((_, idx) => (
                                                        <button
                                                            key={idx}
                                                            className={`product-img-dot ${idx === currentImageIndex ? 'active' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setCurrentImageIndex(idx)
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {images.length > 1 && (
                                        <div className="product-thumbnails">
                                            {images.map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`product-thumb ${idx === currentImageIndex ? 'active' : ''}`}
                                                    onClick={() => setCurrentImageIndex(idx)}
                                                >
                                                    <img src={img.url} alt={img.alt || product.name} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="product-info">
                                <div className="product-card product-header-card">
                                    <h1 className="product-name">{product.name}</h1>
                                    <div className="product-meta">
                                        <span className="product-brand">{product.brand.name}</span>
                                        <span className="product-category">{product.category.name}</span>
                                    </div>
                                    <div className="product-rating">
                                        <Star size={16} fill="#ff8f00" color="#ff8f00" />
                                        <span>{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span>
                                    </div>
                                </div>

                                <div className="product-card product-price-card">
                                    <div className="product-price-block">
                                        <div className="product-price">
                                            {product.price.toLocaleString('uk-UA')} ₴
                                        </div>
                                        {product.oldPrice && (
                                            <div className="product-old-price">
                                                {product.oldPrice.toLocaleString('uk-UA')} ₴
                                            </div>
                                        )}
                                        {discountPercent && (
                                            <span className="product-discount-badge">-{discountPercent}%</span>
                                        )}
                                    </div>
                                    <div className="product-stock-status">
                                        {product.stock > 0 ? (
                                            <span className="in-stock">In stock ({product.stock} available)</span>
                                        ) : (
                                            <span className="out-of-stock">Out of stock</span>
                                        )}
                                    </div>
                                    <div className="product-actions">
                                        <button
                                            className="product-add-to-cart-btn"
                                            disabled={isAdmin || product.stock === 0}
                                            onClick={handleAddToCart}
                                        >
                                            <ShoppingCart size={18} /> Add to cart
                                        </button>
                                        <button
                                            className={`product-wishlist-btn ${isWishlisted ? 'product-wishlist-btn--active' : ''}`}
                                            disabled={isAdmin}
                                            onClick={handleToggleWishlist}
                                        >
                                            <Heart size={18} fill={isWishlisted ? '#e53935' : 'none'} color={isWishlisted ? '#e53935' : '#999'} />
                                        </button>
                                    </div>
                                </div>

                                {(product.shortDescription || product.description) && (
                                    <div className="product-card product-description-card">
                                        {product.shortDescription && (
                                            <div className="product-short-desc">
                                                <h3>Description</h3>
                                                <p>{product.shortDescription}</p>
                                            </div>
                                        )}
                                        {product.description && (
                                            <div className="product-full-desc">
                                                <h3>Details</h3>
                                                <p>{product.description}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {tab === 'specs' && (
                        <div className="product-specs">
                            <h2>Specifications</h2>
                            {(() => {
                                const builtIn: { name: string; value: string }[] = [
                                    { name: 'Brand', value: product.brand?.name || '—' },
                                    { name: 'Category', value: product.category?.name || '—' },
                                    { name: 'Warranty', value: product.warrantyMonths ? `${product.warrantyMonths} months` : '—' },
                                    { name: 'Power', value: product.powerW ? `${product.powerW} W` : '—' },
                                    { name: 'Energy class', value: product.energyClass || '—' },
                                    { name: 'Color', value: product.color || '—' },
                                    { name: 'Material', value: product.material || '—' },
                                    { name: 'Weight', value: product.weightKg ? `${product.weightKg} kg` : '—' },
                                ]

                                const extraSpecs = (product.specifications || []).map(spec => ({
                                    name: spec.name,
                                    value: `${spec.value}${spec.unit ? ` ${spec.unit}` : ''}`,
                                }))

                                const allSpecs = [...builtIn, ...extraSpecs]

                                return (
                                    <table className="specs-table">
                                        <tbody>
                                        {allSpecs.map((row, idx) => (
                                            <tr key={idx}>
                                                <td className="spec-name">{row.name}</td>
                                                <td className="spec-value">{row.value}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )
                            })()}
                        </div>
                    )}

                    {tab === 'reviews' && (
                        <div className="product-reviews">
                            <h2>Reviews</h2>

                            {(reviewForm.parentId || showNewReviewForm) && (
                                <div className="review-form-card">
                                    <h3>{reviewForm.parentId ? 'Reply to review' : 'Write a review'}</h3>
                                    {!reviewForm.parentId && (
                                        <div className="review-rating-select">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`star-btn ${star <= reviewForm.rating ? 'active' : ''}`}
                                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                >
                                                    <Star size={20} fill={star <= reviewForm.rating ? '#ff8f00' : 'none'} color="#ff8f00" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {!reviewForm.parentId && (
                                        <input
                                            placeholder="Title (optional)"
                                            value={reviewForm.title}
                                            onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                                        />
                                    )}
                                    <textarea
                                        placeholder="Your comment"
                                        value={reviewForm.comment}
                                        onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        required
                                    />
                                    <div className="review-form-buttons">
                                        <button onClick={handleReviewSubmit} disabled={submitting}>
                                            {submitting ? 'Submitting...' : 'Submit'}
                                        </button>
                                        {reviewForm.parentId && (
                                            <button type="button" onClick={cancelReply}>Cancel reply</button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {reviews.length === 0 ? (
                                <p className="no-reviews">No reviews yet. Be the first!</p>
                            ) : (
                                reviews.map((review: any) => (
                                    <div key={review.id} className={`review-item ${review.user?.role === 'ADMIN' ? 'review-item--admin' : ''}`}>
                                        <div className="review-header">
                                            <div className="review-user">
                                                <strong>{review.user?.fullName || 'User'}</strong>
                                                {review.user?.role === 'ADMIN' && <span className="admin-badge">Admin</span>}
                                            </div>
                                            {review.rating > 0 && (
                                                <div className="review-stars">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} size={14} fill={s <= review.rating ? '#ff8f00' : 'none'} color="#ff8f00" />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {review.title && <h4 className="review-title">{review.title}</h4>}
                                        <p className="review-comment">{review.comment}</p>
                                        {token && <button className="reply-btn" onClick={() => startReply(review.id)}>Reply</button>}

                                        {review.replies?.length > 0 && (
                                            <div className="replies">
                                                {review.replies.map((reply: any) => (
                                                    <div key={reply.id} className={`reply-item ${reply.user?.role === 'ADMIN' ? 'reply-item--admin' : ''}`}>
                                                        <div className="reply-user">
                                                            <strong>{reply.user?.fullName || 'Admin'}</strong>
                                                            {reply.user?.role === 'ADMIN' && <span className="admin-badge">Admin</span>}
                                                        </div>
                                                        <p>{reply.comment}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}