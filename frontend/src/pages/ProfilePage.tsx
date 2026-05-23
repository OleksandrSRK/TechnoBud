import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/ProfilePageStyles.css'
import { API_BASE } from '../api'

type UserData = {
    id: number
    email: string
    fullName: string
    phone: string | null
    role: 'CUSTOMER' | 'ADMIN'
}

type ProfilePageProps = {
    isLoggedIn: boolean
    setIsLoggedIn: (value: boolean) => void
}

export default function ProfilePage({ isLoggedIn, setIsLoggedIn }: ProfilePageProps) {
    const navigate = useNavigate()
    const location = useLocation()

    const [user, setUser] = useState<UserData | null>(null)
    const [editMode, setEditMode] = useState(false)
    const [form, setForm] = useState({ fullName: '', phone: '' })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        console.log('[ProfilePage] useEffect triggered. isLoggedIn:', isLoggedIn, 'pathname:', location.pathname)
        const stored = localStorage.getItem('user')
        console.log('[ProfilePage] localStorage user:', stored)
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                console.log('[ProfilePage] parsed user:', parsed)
                setUser(parsed)
                setForm({ fullName: parsed.fullName || '', phone: parsed.phone || '' })
            } catch (e) {
                console.error('[ProfilePage] Invalid user JSON', e)
                setUser(null)
            }
        } else {
            console.log('[ProfilePage] No user in localStorage, setting null')
            setUser(null)
        }
    }, [isLoggedIn, location.pathname])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('role')
        setIsLoggedIn(false)
        navigate('/')
    }

    const handleSave = async () => {
        if (!user) return
        setSaving(true)
        setError(null)

        try {
            const res = await fetch(`${API_BASE}/auth/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ fullName: form.fullName, phone: form.phone }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || 'Update failed')
            }

            const updatedUser = await res.json()
            localStorage.setItem('user', JSON.stringify(updatedUser))
            setUser(updatedUser)
            setEditMode(false)
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setSaving(false)
        }
    }

    if (!user) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <p className="profile-empty">No user data found. Please log in.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="profile-page">
            <div className="profile-bg" />
            <div className="profile-container">
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2>{user.fullName}</h2>
                            <p className="profile-role">{user.role === 'ADMIN' ? 'Administrator' : 'Customer'}</p>
                        </div>
                    </div>

                    {error && <div className="profile-error">{error}</div>}

                    <div className="profile-details">
                        <div className="profile-field">
                            <label>Email</label>
                            <p>{user.email}</p>
                        </div>

                        {editMode ? (
                            <>
                                <div className="profile-field">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={form.fullName}
                                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="profile-field">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="profile-field">
                                    <label>Full Name</label>
                                    <p>{user.fullName}</p>
                                </div>
                                <div className="profile-field">
                                    <label>Phone</label>
                                    <p>{user.phone || '—'}</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="profile-actions">
                        {editMode ? (
                            <>
                                <button
                                    className="profile-btn profile-save-btn"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    className="profile-btn profile-cancel-btn"
                                    onClick={() => setEditMode(false)}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                className="profile-btn profile-edit-btn"
                                onClick={() => setEditMode(true)}
                            >
                                Edit Profile
                            </button>
                        )}

                        {user.role !== 'ADMIN' && (
                            <button
                                className="profile-btn profile-orders-btn"
                                onClick={() => navigate('/orders')}
                            >
                                My Orders
                            </button>
                        )}

                        <button
                            className="profile-btn profile-logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}