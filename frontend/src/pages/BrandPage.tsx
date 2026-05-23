import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import ProductCard from '../components/products/ProductCard'
import '../styles/BrandPage.css'
import { API_BASE } from '../api'

const API = API_BASE

type BrandData = {
    id: number
    name: string
    slug: string
    logoUrl?: string
    websiteUrl?: string
    description?: string
    products: any[]
    categories: { id: number; name: string; slug: string }[]
}

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
}

export default function BrandPage() {
    const { slug } = useParams<{ slug: string }>()
    const [brand, setBrand] = useState<BrandData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [sortBy, setSortBy] = useState('default')

    const [wishlistIds, setWishlistIds] = useState<number[]>([])

    const loadWishlist = async () => {
        const token = localStorage.getItem('token')
        if (!token) return
        try {
            const res = await fetch(`${API}/wishlist`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setWishlistIds(data.map((p: any) => p.id))
            }
        } catch { /* ignore */ }
    }

    useEffect(() => {
        const loadBrand = async () => {
            try {
                setError(null)
                const res = await fetch(`${API}/brands/${slug}`)
                if (!res.ok) {
                    const data = await res.json().catch(() => null)
                    throw new Error(data?.message || 'Brand not found')
                }
                const data: BrandData = await res.json()
                setBrand(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        loadBrand()
        loadWishlist()
    }, [slug])

    const handleToggleWishlist = async (productId: number) => {
        const token = localStorage.getItem('token')
        if (!token) return
        const method = wishlistIds.includes(productId) ? 'DELETE' : 'POST'
        try {
            const res = await fetch(`${API}/wishlist/${productId}`, {
                method,
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                if (method === 'POST') {
                    setWishlistIds(prev => [...prev, productId])
                } else {
                    setWishlistIds(prev => prev.filter(id => id !== productId))
                }
                window.dispatchEvent(new Event('wishlistUpdated'))
            }
        } catch { /* ignore */ }
    }

    const products: ViewProduct[] = useMemo(() => {
        if (!brand) return []
        return brand.products.map((p: any) => {
            const mainImg = p.images?.find((img: any) => img.isMain) || p.images?.[0]
            return {
                id: p.id,
                name: p.name,
                price: Number(p.price),
                oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
                currency: p.currency || 'UAH',
                category: p.category?.name || '',
                categorySlug: p.category?.slug || '',
                brand: brand.name,
                brandSlug: brand.slug,
                imageUrl: mainImg?.url || null,
                rating: p.rating || 0,
                reviewCount: p.reviewCount || 0,
                stock: p.stock,
                images: p.images || [],
            }
        })
    }, [brand])

    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'all') return products
        return products.filter(p => p.categorySlug === selectedCategory)
    }, [products, selectedCategory])

    const sortedProducts = useMemo(() => {
        const list = [...filteredProducts]
        switch (sortBy) {
            case 'price-asc': list.sort((a, b) => a.price - b.price); break
            case 'price-desc': list.sort((a, b) => b.price - a.price); break
            case 'name-asc': list.sort((a, b) => a.name.localeCompare(b.name)); break
            case 'rating-desc': list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break
            default: break
        }
        return list
    }, [filteredProducts, sortBy])

    if (loading) return <div className="brand-page-loading">Loading...</div>
    if (error || !brand) return <div className="brand-page-loading">{error || 'Brand not found'}</div>

    return (
        <div className="brand-page">
            <main className="brand-main">
                <section className="brand-banner">
                    <div className="brand-banner-content">
                        {brand.logoUrl && (
                            <img src={brand.logoUrl} alt={brand.name} className="brand-logo" />
                        )}
                        <div>
                            <h1>{brand.name}</h1>
                            {brand.description && <p>{brand.description}</p>}
                            {brand.websiteUrl && (
                                <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer" className="brand-website">
                                    Official website ↗
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                <div className="brand-categories">
                    <button
                        className={`brand-category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        All
                    </button>
                    {brand.categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`brand-category-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.slug)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="brand-toolbar">
                    <div className="brand-count">{sortedProducts.length} products</div>
                    <div className="brand-sort">
                        <label>Sort by:</label>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="default">Default</option>
                            <option value="price-asc">Price: low to high</option>
                            <option value="price-desc">Price: high to low</option>
                            <option value="rating-desc">Rating: high to low</option>
                            <option value="name-asc">Name: A to Z</option>
                        </select>
                    </div>
                </div>

                {sortedProducts.length === 0 ? (
                    <div className="brand-empty">No products found in this category.</div>
                ) : (
                    <div className="brand-grid brand-grid--small">
                        {sortedProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isWishlisted={wishlistIds.includes(product.id)}
                                onToggleWishlist={handleToggleWishlist}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}