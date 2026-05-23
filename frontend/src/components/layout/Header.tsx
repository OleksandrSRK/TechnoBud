import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../../api'
import {
    ChevronDown,
    Heart,
    Menu,
    Search,
    ShoppingCart,
    UserRound,
    Package2,
    ShieldCheck,
} from 'lucide-react'
import './Header.css'

type HeaderProps = {
    catalogOpen: boolean
    setCatalogOpen: (value: boolean) => void
    isLoggedIn: boolean
    search: string
    setSearch: (value: string) => void
}

type Category = {
    id: number
    name: string
    slug: string
}

type Brand = {
    id: number
    name: string
    slug: string
}

type UserData = {
    id: number
    email: string
    role: 'CUSTOMER' | 'ADMIN'
}

export default function Header({
                                   catalogOpen,
                                   setCatalogOpen,
                                   isLoggedIn,
                                   search,
                                   setSearch,
                               }: HeaderProps) {
    const navigate = useNavigate()
    const catalogRef = useRef<HTMLDivElement | null>(null)

    const [categories, setCategories] = useState<Category[]>([])
    const [brands, setBrands] = useState<Brand[]>([])
    const [user, setUser] = useState<UserData | null>(null)

    const [wishlistCount, setWishlistCount] = useState(0)
    const [cartCount, setCartCount] = useState(0)

    const loadWishlist = useCallback(async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            setWishlistCount(0)
            return
        }
        try {
            const res = await fetch(`${API_BASE}/wishlist`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setWishlistCount(data.length)
            }
        } catch {}
    }, [])

    const loadCart = useCallback(async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            setCartCount(0)
            return
        }
        try {
            const res = await fetch(`${API_BASE}/cart`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                const total = data.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
                setCartCount(total)
            }
        } catch {}
    }, [])

    useEffect(() => {
        loadWishlist()
        loadCart()
    }, [isLoggedIn, loadWishlist, loadCart])

    useEffect(() => {
        const handler = () => loadWishlist()
        window.addEventListener('wishlistUpdated', handler)
        return () => window.removeEventListener('wishlistUpdated', handler)
    }, [loadWishlist])

    useEffect(() => {
        const handler = () => loadCart()
        window.addEventListener('cartUpdated', handler)
        return () => window.removeEventListener('cartUpdated', handler)
    }, [loadCart])

    useEffect(() => {
        if (!catalogOpen) return
        const loadCatalogData = async () => {
            try {
                const [categoriesRes, brandsRes] = await Promise.all([
                    fetch(`${API_BASE}categories`),
                    fetch(`${API_BASE}/brands`),
                ])
                const categoriesData = await categoriesRes.json()
                const brandsData = await brandsRes.json()
                setCategories(Array.isArray(categoriesData) ? categoriesData : [])
                setBrands(Array.isArray(brandsData) ? brandsData : [])
            } catch (error) {
                console.error('Failed to load catalog data:', error)
            }
        }
        loadCatalogData()
    }, [catalogOpen])

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (error) {
                console.error('Invalid user JSON:', error)
            }
        }
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (catalogRef.current && !catalogRef.current.contains(event.target as Node)) {
                setCatalogOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [setCatalogOpen])

    return (
        <header className="tb-header">
            <div className="tb-container tb-header-inner">
                <div
                    className="tb-brand"
                    onClick={() => navigate('/')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="tb-brand-mark">
                        <Package2 size={22} />
                    </div>
                    <div>
                        <div className="tb-brand-title">TechnoBud</div>
                        <div className="tb-brand-sub">Home appliances store</div>
                    </div>
                </div>

                <div className="tb-catalog-wrap" ref={catalogRef}>
                    <button
                        type="button"
                        className={`tb-catalog-btn ${catalogOpen ? 'is-open' : ''}`}
                        onClick={() => setCatalogOpen(!catalogOpen)}
                    >
                        <Menu size={18} />
                        <span>Catalog</span>
                        <ChevronDown size={16} className={catalogOpen ? 'rotated' : ''} />
                    </button>

                    {catalogOpen && (
                        <div className="tb-catalog-dropdown">
                            <div className="tb-catalog-column">
                                <h3>Categories</h3>
                                <div className="tb-catalog-list">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            className="tb-catalog-item"
                                            onClick={() => {
                                                navigate(`/category/${category.slug}`)
                                                setCatalogOpen(false)
                                            }}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="tb-catalog-column">
                                <h3>Brands</h3>
                                <div className="tb-catalog-list">
                                    {brands.map((brand) => (
                                        <button
                                            key={brand.id}
                                            type="button"
                                            className="tb-catalog-item"
                                            onClick={() => {
                                                navigate(`/brand/${brand.slug}`)
                                                setCatalogOpen(false)
                                            }}
                                        >
                                            {brand.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="tb-search">
                    <input
                        type="text"
                        placeholder="Search appliances, brands, models..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Search size={18} />
                </div>

                <div className="tb-actions">
                    {isLoggedIn ? (
                        <>
                            {user?.role === 'ADMIN' && (
                                <button
                                    type="button"
                                    className="tb-link-btn"
                                    onClick={() => navigate('/admin')}
                                >
                                    <ShieldCheck size={18} />
                                </button>
                            )}
                            <button
                                type="button"
                                className="tb-link-btn tb-link-btn-primary"
                                onClick={() => navigate('/profile')}
                            >
                                <UserRound size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="tb-link-btn"
                                onClick={() => navigate('/register')}
                            >
                                Register
                            </button>
                            <button
                                type="button"
                                className="tb-link-btn tb-link-btn-primary"
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </button>
                        </>
                    )}

                    {user?.role !== 'ADMIN' && (
                        <>
                            <button
                                type="button"
                                className="tb-icon-btn"
                                title="Wishlist"
                                onClick={() => navigate('/wishlist')}
                            >
                                <Heart size={18} />
                                {wishlistCount > 0 && (
                                    <span className="tb-icon-badge">{wishlistCount}</span>
                                )}
                            </button>
                            <button
                                type="button"
                                className="tb-icon-btn"
                                title="Cart"
                                onClick={() => navigate('/cart')}
                            >
                                <ShoppingCart size={18} />
                                {cartCount > 0 && (
                                    <span className="tb-icon-badge">{cartCount}</span>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}