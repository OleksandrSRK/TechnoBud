import { useNavigate } from 'react-router-dom'
import {
    ChevronDown,
    Heart,
    Menu,
    Search,
    ShoppingCart,
    UserRound,
    Package2,
} from 'lucide-react'
import './Header.css'

type HeaderProps = {
    catalogOpen: boolean
    setCatalogOpen: (value: boolean) => void
    isLoggedIn: boolean
    search: string
    setSearch: (value: string) => void
}

export default function Header({
                                   catalogOpen,
                                   setCatalogOpen,
                                   isLoggedIn,
                                   search,
                                   setSearch,
                               }: HeaderProps) {
    const navigate = useNavigate()

    return (
        <header className="tb-header">
            <div className="tb-container tb-header-inner">
                <div className="tb-brand">
                    <div className="tb-brand-mark">
                        <Package2 size={22} />
                    </div>
                    <div>
                        <div className="tb-brand-title">TechnoBud</div>
                        <div className="tb-brand-sub">Home appliances store</div>
                    </div>
                </div>

                <div className="tb-catalog-wrap">
                    <button
                        type="button"
                        className={`tb-catalog-btn ${catalogOpen ? 'is-open' : ''}`}
                        onClick={() => setCatalogOpen(!catalogOpen)}
                    >
                        <Menu size={18} />
                        Catalog
                        <ChevronDown size={16} className={catalogOpen ? 'rotated' : ''} />
                    </button>
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
                        <button
                            type="button"
                            className="tb-link-btn tb-link-btn-primary"
                            onClick={() => navigate('/account')}
                        >
                            <UserRound size={18} />
                            Account
                        </button>
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

                    <button type="button" className="tb-icon-btn" title="Wishlist">
                        <Heart size={18} />
                    </button>

                    <button type="button" className="tb-icon-btn" title="Cart">
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>
        </header>
    )
}