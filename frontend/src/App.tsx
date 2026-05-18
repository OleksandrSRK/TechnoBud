import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import AccountPage from './pages/AccountPage'
import Header from './components/layout/Header'
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
                <Route path="/" element={<HomePage />} />
                <Route
                    path="/register"
                    element={<RegisterPage setIsLoggedIn={setIsLoggedIn} />}
                />
                <Route path="/account" element={<AccountPage />} />
            </Routes>
        </>
    )
}