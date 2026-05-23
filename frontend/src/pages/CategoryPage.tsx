import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import ProductCard from '../components/products/ProductCard'
import '../styles/CategoryPage.css'
import { API_BASE } from '../api'

const API = API_BASE

type CategoryData = {
    id: number
    name: string
    slug: string
    description?: string
    imageUrl?: string
    products: any[]
    brands: { id: number; name: string; slug: string }[]
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

export default function CategoryPage() {
    const { slug } = useParams<{ slug: string }>()
    const [category, setCategory] = useState<CategoryData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedBrand, setSelectedBrand] = useState('all')
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
        } catch {}
    }

    useEffect(() => {
        const loadCategory = async () => {
            try {
                setError(null)
                const res = await fetch(`${API}/categories/${slug}`)
                if (!res.ok) {
                    const data = await res.json().catch(() => null)
                    throw new Error(data?.message || 'Category not found')
                }
                const data: CategoryData = await res.json()
                setCategory(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        loadCategory()
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
        } catch {}
    }

    const products: ViewProduct[] = useMemo(() => {
        if (!category) return []
        return category.products.map((p: any) => {
            const mainImg = p.images?.find((img: any) => img.isMain) || p.images?.[0]
            return {
                id: p.id,
                name: p.name,
                price: Number(p.price),
                oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
                currency: p.currency || 'UAH',
                category: category.name,
                categorySlug: category.slug,
                brand: p.brand?.name || '',
                brandSlug: p.brand?.slug || '',
                imageUrl: mainImg?.url || null,
                rating: p.rating || 0,
                reviewCount: p.reviewCount || 0,
                stock: p.stock,
                images: p.images || [],
            }
        })
    }, [category])

    const filteredProducts = useMemo(() => {
        if (selectedBrand === 'all') return products
        return products.filter(p => p.brandSlug === selectedBrand)
    }, [products, selectedBrand])

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

    if (loading) return <div className="category-page-loading">Loading...</div>
    if (error || !category) return <div className="category-page-loading">{error || 'Category not found'}</div>

    return (
        <div className="category-page">
            <main className="category-main">
                <section className="category-banner">
                    <div className="category-banner-content">
                        {category.imageUrl && (
                            <img src={category.imageUrl} alt={category.name} className="category-logo" />
                        )}
                        <div>
                            <h1>{category.name}</h1>
                            {category.description && <p>{category.description}</p>}
                        </div>
                    </div>
                </section>

                <div className="category-brands">
                    <button
                        className={`category-brand-btn ${selectedBrand === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedBrand('all')}
                    >
                        All brands
                    </button>
                    {category.brands.map(brand => (
                        <button
                            key={brand.id}
                            className={`category-brand-btn ${selectedBrand === brand.slug ? 'active' : ''}`}
                            onClick={() => setSelectedBrand(brand.slug)}
                        >
                            {brand.name}
                        </button>
                    ))}
                </div>

                <div className="category-toolbar">
                    <div className="category-count">{sortedProducts.length} products</div>
                    <div className="category-sort">
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
                    <div className="category-empty">No products found for this brand.</div>
                ) : (
                    <div className="category-grid category-grid--small">
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








