import { useState } from 'react'
import { Link } from 'react-router-dom'

type Props = {
    onSuccess?: () => void
}

export default function LoginFormUI({ onSuccess }: Props) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const validateForm = () => {
        if (!email.trim()) return 'Please enter your email'

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) return 'Please enter a valid email address'

        if (!password) return 'Please enter your password'
        if (password.length < 6) return 'Password must be at least 6 characters long'

        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            return
        }

        setLoading(true)

        try {
            const res = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Login failed')
            }

            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            localStorage.setItem('role', data.user.role)

            onSuccess?.()
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Login</h2>

            <div className={`auth-error ${error ? 'visible' : ''}`}>
                {error || 'Placeholder'}
            </div>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="auth-switch-text">
                Don&apos;t have an account? <Link to="/register">Register</Link>
            </p>
        </form>
    )
}