import { useState } from 'react'

type Props = {
    onSuccess?: () => void
}

export default function RegistrationFormUI({ onSuccess }: Props) {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const validateForm = () => {
        if (!fullName.trim()) return 'Please enter your full name'
        if (fullName.trim().length < 3) return 'Full name must be at least 3 characters long'

        if (!email.trim()) return 'Please enter your email'

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) return 'Please enter a valid email address'

        if (phone) {
            const cleanedPhone = phone.replace(/[\s()+-]/g, '')

            if (!/^\d{10,15}$/.test(cleanedPhone)) {
                return 'Please enter a valid phone number'
            }
        }

        if (!password) return 'Please enter your password'
        if (password.length < 6) return 'Password must be at least 6 characters long'

        if (!confirmPassword) return 'Please confirm your password'
        if (password !== confirmPassword) return 'Passwords do not match'

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
            const res = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    phone,
                    password,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed')
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
            <h2>Create account</h2>

            <div className={`auth-error ${error ? 'visible' : ''}`}>
                {error || 'Placeholder'}
            </div>

            <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
            />

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="text"
                placeholder="Phone (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
            </button>
        </form>
    )
}