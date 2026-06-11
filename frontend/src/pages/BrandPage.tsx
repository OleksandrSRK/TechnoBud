import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import ProductCard from '../components/products/ProductCard'
import '../styles/BrandPage.css'
import { API_BASE } from '../api'

const API = API_BASE
const PAGE_SIZE = 12

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

type CategoryRaw = {
    id: number
    name: string
    slug: string
    parentId: number | null
}

type CategoryNode = CategoryRaw & { children: CategoryNode[] }

export default function BrandPage() {
    const { slug } = useParams<{ slug: string }>()
    const [brand, setBrand] = useState<BrandData | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [sortBy, setSortBy] = useState('default')
    const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE)
    const [hasMore, setHasMore] = useState(true)

    const [wishlistIds, setWishlistIds] = useState<number[]>([])
    const sentinelRef = useRef<HTMLDivElement | null>(null)

    const [descendantSlugs, setDescendantSlugs] = useState<Map<string, string[]>>(new Map())

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
        const loadData = async () => {
            try {
                setError(null)
                const [brandRes, categoriesRes] = await Promise.all([
                    fetch(`${API}/brands/${slug}`),
                    fetch(`${API}/categories?all=true`)
                ])

                if (!brandRes.ok) {
                    const data = await brandRes.json().catch(() => null)
                    throw new Error(data?.message || 'Brand not found')
                }
                const brandData: BrandData = await brandRes.json()
                setBrand(brandData)

                if (categoriesRes.ok) {
                    const cats: CategoryRaw[] = await categoriesRes.json()
                    const map = new Map<number, CategoryNode>()
                    const roots: CategoryNode[] = []
                    cats.forEach(c => map.set(c.id, { ...c, children: [] }))
                    cats.forEach(c => {
                        const node = map.get(c.id)!
                        if (c.parentId === null) {
                            roots.push(node)
                        } else {
                            map.get(c.parentId)?.children.push(node)
                        }
                    })

                    const getSlugs = (node: CategoryNode): string[] => {
                        const slugs = [node.slug]
                        node.children.forEach(child => {
                            slugs.push(...getSlugs(child))
                        })
                        return slugs
                    }

                    const slugMap = new Map<string, string[]>()
                    roots.forEach(root => {
                        slugMap.set(root.slug, getSlugs(root))
                    })
                    setDescendantSlugs(slugMap)
                }
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        loadData()
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

    const selectedCategorySlugs = useMemo(() => {
        if (selectedCategory === 'all') return []
        return descendantSlugs.get(selectedCategory) || [selectedCategory]
    }, [selectedCategory, descendantSlugs])

    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'all') return products
        return products.filter(p => selectedCategorySlugs.includes(p.categorySlug))
    }, [products, selectedCategory, selectedCategorySlugs])

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

    useEffect(() => {
        setDisplayedCount(PAGE_SIZE)
    }, [selectedCategory, sortBy])

    const visibleProducts = useMemo(() => {
        return sortedProducts.slice(0, displayedCount)
    }, [sortedProducts, displayedCount])

    useEffect(() => {
        setHasMore(displayedCount < sortedProducts.length)
    }, [displayedCount, sortedProducts.length])

    const loadMore = useCallback(() => {
        if (loadingMore || !hasMore) return
        setLoadingMore(true)
        setTimeout(() => {
            setDisplayedCount(prev => Math.min(prev + PAGE_SIZE, sortedProducts.length))
            setLoadingMore(false)
        }, 400)
    }, [loadingMore, hasMore, sortedProducts.length])

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMore()
                }
            },
            { rootMargin: '200px' }
        )

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [loadMore, hasMore, loadingMore])

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

                {visibleProducts.length === 0 ? (
                    <div className="brand-empty">No products found in this category.</div>
                ) : (
                    <div className="brand-grid brand-grid--small">
                        {visibleProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isWishlisted={wishlistIds.includes(product.id)}
                                onToggleWishlist={handleToggleWishlist}
                            />
                        ))}
                    </div>
                )}

                <div ref={sentinelRef} style={{ height: 1 }} />

                {loadingMore && (
                    <div className="brand-loading-more">Loading more...</div>
                )}
                {!hasMore && sortedProducts.length > 0 && (
                    <div className="brand-no-more">You've reached the end of the list.</div>
                )}
            </main>
        </div>
    )
}