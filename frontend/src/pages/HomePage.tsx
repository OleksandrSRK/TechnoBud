import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import ProductCard from '../components/products/ProductCard'
import '../styles/HomePageStyles.css'
import { API_BASE } from '../api'

type ApiProductImage = {
    id: number
    url: string
    alt?: string | null
    sortOrder: number
    isMain: boolean
}

type ApiProduct = {
    id: number
    sku: string
    slug: string
    name: string
    shortDescription?: string | null
    description: string
    price: string | number
    oldPrice?: string | number | null
    currency: string
    stock: number
    reservedStock: number
    rating: number
    reviewCount: number
    warrantyMonths?: number | null
    powerW?: number | null
    energyClass?: string | null
    color?: string | null
    material?: string | null
    weightKg?: string | number | null
    isFeatured: boolean
    isActive: boolean
    category: {
        id: number
        name: string
        slug: string
    }
    brand: {
        id: number
        name: string
        slug: string
    }
    images?: ApiProductImage[]
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
    warrantyMonths?: number | null
    powerW?: number | null
    energyClass?: string | null
    color?: string | null
    material?: string | null
    weightKg?: number | null
    isFeatured: boolean
    images?: ApiProductImage[]
}

type FilterOption = {
    name: string
    slug: string
}

type HomePageProps = {
    search: string
    isLoggedIn: boolean
}

function toNumber(value: unknown): number {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
        const parsed = Number(value)
        return Number.isNaN(parsed) ? 0 : parsed
    }
    return 0
}

function normalizeText(value?: string | null): string {
    return (value || '').trim().toLowerCase()
}

const PAGE_SIZE = 12

export default function HomePage({ search, isLoggedIn }: HomePageProps) {
    const [allProducts, setAllProducts] = useState<ViewProduct[]>([])
    const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)

    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedBrand, setSelectedBrand] = useState('all')
    const [selectedColor, setSelectedColor] = useState('all')
    const [selectedMaterial, setSelectedMaterial] = useState('all')
    const [selectedEnergyClass, setSelectedEnergyClass] = useState('all')
    const [minRating, setMinRating] = useState('0')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [inStockOnly, setInStockOnly] = useState(false)
    const [sortBy, setSortBy] = useState('default')

    const [wishlistIds, setWishlistIds] = useState<number[]>([])
    const sentinelRef = useRef<HTMLDivElement | null>(null)

    const loadWishlist = useCallback(async () => {
        const token = localStorage.getItem('token')
        if (!token) return
        try {
            const res = await fetch(`${API_BASE}/wishlist`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setWishlistIds(data.map((p: any) => p.id))
            }
        } catch (err) {
            console.error('Failed to load wishlist', err)
        }
    }, [])

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setError(null)
                const res = await fetch(`${API_BASE}/products`)
                if (!res.ok) {
                    const errorData = await res.json().catch(() => null)
                    throw new Error(
                        errorData?.message || `Failed to load products (${res.status})`
                    )
                }
                const data: unknown = await res.json()
                if (!Array.isArray(data)) {
                    throw new Error('Invalid products response from server')
                }

                const mappedProducts: ViewProduct[] = (data as ApiProduct[])
                    .filter((product) => product.isActive !== false)
                    .map((product) => {
                        const sortedImages = product.images
                            ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)
                            : []
                        const mainImage =
                            sortedImages.find((image) => image.isMain) || sortedImages[0]

                        return {
                            id: product.id,
                            name: product.name,
                            price: toNumber(product.price),
                            oldPrice: product.oldPrice != null ? toNumber(product.oldPrice) : null,
                            currency: product.currency || 'UAH',
                            category: product.category?.name || 'Unknown',
                            categorySlug: product.category?.slug || 'unknown',
                            brand: product.brand?.name || 'Unknown',
                            brandSlug: product.brand?.slug || 'unknown',
                            imageUrl: mainImage?.url || null,
                            rating: product.rating ?? 0,
                            reviewCount: product.reviewCount ?? 0,
                            stock: product.stock ?? 0,
                            warrantyMonths: product.warrantyMonths ?? null,
                            powerW: product.powerW ?? null,
                            energyClass: product.energyClass ?? null,
                            color: product.color ?? null,
                            material: product.material ?? null,
                            weightKg: product.weightKg != null ? toNumber(product.weightKg) : null,
                            isFeatured: product.isFeatured ?? false,
                            images: sortedImages,
                        }
                    })

                setAllProducts(mappedProducts)
            } catch (err) {
                console.error('Failed to load products:', err)
                setAllProducts([])
                setError(err instanceof Error ? err.message : 'Failed to load products')
            } finally {
                setLoading(false)
            }
        }

        loadProducts()
    }, [])

    useEffect(() => {
        loadWishlist()
    }, [isLoggedIn, loadWishlist])

    const handleToggleWishlist = async (productId: number) => {
        const token = localStorage.getItem('token')
        if (!token) return
        const method = wishlistIds.includes(productId) ? 'DELETE' : 'POST'
        try {
            const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
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
        } catch (err) {
            console.error('Wishlist toggle error', err)
        }
    }

    const filteredProducts = useMemo(() => {
        const minPriceNumber = minPrice ? Number(minPrice) : null
        const maxPriceNumber = maxPrice ? Number(maxPrice) : null
        const minRatingNumber = Number(minRating)

        let result = [...allProducts]

        if (selectedCategory !== 'all') result = result.filter(p => p.categorySlug === selectedCategory)
        if (selectedBrand !== 'all') result = result.filter(p => p.brandSlug === selectedBrand)
        if (selectedColor !== 'all') result = result.filter(p => normalizeText(p.color) === selectedColor)
        if (selectedMaterial !== 'all') result = result.filter(p => normalizeText(p.material) === selectedMaterial)
        if (selectedEnergyClass !== 'all') result = result.filter(p => normalizeText(p.energyClass) === selectedEnergyClass)
        if (minPriceNumber !== null && !Number.isNaN(minPriceNumber)) result = result.filter(p => p.price >= minPriceNumber)
        if (maxPriceNumber !== null && !Number.isNaN(maxPriceNumber)) result = result.filter(p => p.price <= maxPriceNumber)
        if (!Number.isNaN(minRatingNumber) && minRatingNumber > 0) result = result.filter(p => (p.rating ?? 0) >= minRatingNumber)
        if (inStockOnly) result = result.filter(p => p.stock > 0)

        if (search.trim()) {
            const q = search.trim().toLowerCase()
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q)
            )
        }

        switch (sortBy) {
            case 'price-asc': result.sort((a, b) => a.price - b.price); break
            case 'price-desc': result.sort((a, b) => b.price - a.price); break
            case 'rating-desc': result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break
            case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break
            default: break
        }

        return result
    }, [allProducts, selectedCategory, selectedBrand, selectedColor, selectedMaterial, selectedEnergyClass, minPrice, maxPrice, minRating, inStockOnly, sortBy, search])

    useEffect(() => {
        setDisplayedCount(PAGE_SIZE)
    }, [filteredProducts])

    const visibleProducts = useMemo(() => {
        return filteredProducts.slice(0, displayedCount)
    }, [filteredProducts, displayedCount])

    useEffect(() => {
        setHasMore(displayedCount < filteredProducts.length)
    }, [displayedCount, filteredProducts.length])

    const loadMore = useCallback(() => {
        if (loadingMore || !hasMore) return
        setLoadingMore(true)
        setTimeout(() => {
            setDisplayedCount(prev => Math.min(prev + PAGE_SIZE, filteredProducts.length))
            setLoadingMore(false)
        }, 400)
    }, [loadingMore, hasMore, filteredProducts.length])

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

    const categories: FilterOption[] = useMemo(() => {
        const unique = new Map<string, FilterOption>()
        allProducts.forEach((product) => {
            if (!unique.has(product.categorySlug)) {
                unique.set(product.categorySlug, { name: product.category, slug: product.categorySlug })
            }
        })
        return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name))
    }, [allProducts])

    const brands: FilterOption[] = useMemo(() => {
        const unique = new Map<string, FilterOption>()
        allProducts.forEach((product) => {
            if (!unique.has(product.brandSlug)) {
                unique.set(product.brandSlug, { name: product.brand, slug: product.brandSlug })
            }
        })
        return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name))
    }, [allProducts])

    const colors: FilterOption[] = useMemo(() => {
        const unique = new Map<string, FilterOption>()
        allProducts.forEach((product) => {
            const value = normalizeText(product.color)
            if (value && !unique.has(value)) {
                unique.set(value, { name: product.color as string, slug: value })
            }
        })
        return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name))
    }, [allProducts])

    const materials: FilterOption[] = useMemo(() => {
        const unique = new Map<string, FilterOption>()
        allProducts.forEach((product) => {
            const value = normalizeText(product.material)
            if (value && !unique.has(value)) {
                unique.set(value, { name: product.material as string, slug: value })
            }
        })
        return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name))
    }, [allProducts])

    const energyClasses: FilterOption[] = useMemo(() => {
        const unique = new Map<string, FilterOption>()
        allProducts.forEach((product) => {
            const value = normalizeText(product.energyClass)
            if (value && !unique.has(value)) {
                unique.set(value, { name: product.energyClass as string, slug: value })
            }
        })
        return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name))
    }, [allProducts])

    const resetFilters = () => {
        setSelectedCategory('all')
        setSelectedBrand('all')
        setSelectedColor('all')
        setSelectedMaterial('all')
        setSelectedEnergyClass('all')
        setMinRating('0')
        setMinPrice('')
        setMaxPrice('')
        setInStockOnly(false)
        setSortBy('default')
    }

    return (
        <div className="home-page">
            <main className="home-main">
                <section className="home-banner">
                    <div className="home-banner-content">
                        <span className="home-banner-badge">TechnoBud store</span>
                        <h1>Everything for your home in one place</h1>
                        <p>
                            Browse appliances loaded from the database and filter them by price,
                            category, brand, rating, stock, color, material and more.
                        </p>
                    </div>
                    <div className="home-banner-card">
                        <div className="home-banner-card-title">Smart filters</div>
                        <div className="home-banner-card-text">Find the right product faster</div>
                    </div>
                </section>

                <section className="home-layout">
                    <aside className="home-sidebar">
                        <h2>Filters</h2>
                        <div className="home-filter-group">
                            <label>Price range</label>
                            <div className="home-filter-row">
                                <input type="number" min="0" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                                <input type="number" min="0" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                            </div>
                        </div>
                        <div className="home-filter-group">
                            <label htmlFor="category">Category</label>
                            <select id="category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                <option value="all">All categories</option>
                                {categories.map((category) => (
                                    <option key={category.slug} value={category.slug}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="home-filter-group">
                            <label htmlFor="brand">Brand</label>
                            <select id="brand" value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                                <option value="all">All brands</option>
                                {brands.map((brand) => (
                                    <option key={brand.slug} value={brand.slug}>{brand.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="home-filter-group">
                            <label htmlFor="rating">Minimum rating</label>
                            <select id="rating" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
                                <option value="0">Any rating</option>
                                <option value="1">1+</option>
                                <option value="2">2+</option>
                                <option value="3">3+</option>
                                <option value="4">4+</option>
                                <option value="5">5</option>
                            </select>
                        </div>
                        <div className="home-filter-group">
                            <label htmlFor="color">Color</label>
                            <select id="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                                <option value="all">All colors</option>
                                {colors.map((color) => (
                                    <option key={color.slug} value={color.slug}>{color.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="home-filter-group">
                            <label htmlFor="material">Material</label>
                            <select id="material" value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)}>
                                <option value="all">All materials</option>
                                {materials.map((material) => (
                                    <option key={material.slug} value={material.slug}>{material.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="home-filter-group">
                            <label htmlFor="energyClass">Energy class</label>
                            <select id="energyClass" value={selectedEnergyClass} onChange={(e) => setSelectedEnergyClass(e.target.value)}>
                                <option value="all">All classes</option>
                                {energyClasses.map((energyClass) => (
                                    <option key={energyClass.slug} value={energyClass.slug}>{energyClass.name}</option>
                                ))}
                            </select>
                        </div>
                        <label className="home-check">
                            <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
                            In stock only
                        </label>
                        <button type="button" className="home-reset-btn" onClick={resetFilters}>Reset filters</button>
                    </aside>

                    <section className="home-products">
                        <div className="home-products-top">
                            <div>
                                <h2>Products</h2>
                                <p>Loaded from database</p>
                            </div>
                            <div className="home-sort">
                                <label htmlFor="sort">Sort by</label>
                                <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="default">Default</option>
                                    <option value="price-asc">Price: low to high</option>
                                    <option value="price-desc">Price: high to low</option>
                                    <option value="rating-desc">Rating: high to low</option>
                                    <option value="name-asc">Name: A to Z</option>
                                </select>
                            </div>
                        </div>

                        <div className="home-count">{filteredProducts.length} items</div>

                        {loading ? (
                            <div className="home-empty">Loading products...</div>
                        ) : error ? (
                            <div className="home-empty">{error}</div>
                        ) : visibleProducts.length === 0 ? (
                            <div className="home-empty">No products found.</div>
                        ) : (
                            <div className="home-grid">
                                {visibleProducts.map((product) => (
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
                            <div className="home-loading-more">Loading more...</div>
                        )}
                        {!hasMore && filteredProducts.length > 0 && (
                            <div className="home-no-more">You've reached the end of the list.</div>
                        )}
                    </section>
                </section>
            </main>
        </div>
    )
}