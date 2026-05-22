import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import Header from './components/layout/Header'
import AdminPage from './pages/AdminPage'
import BrandPage from './pages/BrandPage'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import WishlistPage from './pages/WishlistPage'
import CartPage from './pages/CartPage'
import OrderPage from './pages/OrderPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrdersPage from './pages/OrdersPage'
import { useLocation } from 'react-router-dom'

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [search, setSearch] = useState('')
    const [catalogOpen, setCatalogOpen] = useState(false)

    const location = useLocation()

    const hideHeader =
        location.pathname === '/login' ||
        location.pathname === '/register'

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('token'))
    }, [])

    return (
        <>
            {!hideHeader && (
                <Header
                    catalogOpen={catalogOpen}
                    setCatalogOpen={setCatalogOpen}
                    isLoggedIn={isLoggedIn}
                    search={search}
                    setSearch={setSearch}
                />
            )}

            <Routes>
                <Route path="/" element={<HomePage search={search} isLoggedIn={isLoggedIn} />} />
                <Route path="/register" element={<RegisterPage setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/profile" element={<ProfilePage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/brand/:slug" element={<BrandPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/order" element={<OrderPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                <Route path="/orders" element={<OrdersPage />} />
            </Routes>
        </>
    )
}