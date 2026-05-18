import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/auth.css'

export default function LoginPage() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Login failed')
            }

            // зберігаємо токен
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))

            // перехід на головну сторінку товарів
            navigate('/')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Login to Technobud</h1>
                <p className="auth-subtitle">
                    Access your account, orders and wishlist
                </p>

                <form onSubmit={handleLogin} className="auth-form">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="auth-bottom">
                    Don’t have an account? <a href="/register">Create one</a>
                </p>
            </div>
        </div>
    )
}