import { useNavigate } from 'react-router-dom'
import LoginFormUI from '../components/auth/LoginFormUI'
import '../components/auth/RegistrationLoginFormUI.css'

type Props = {
    setIsLoggedIn: (value: boolean) => void
}

export default function LoginPage({ setIsLoggedIn }: Props) {
    const navigate = useNavigate()

    const handleSuccess = () => {
        setIsLoggedIn(true)
        navigate('/')
    }

    return (
        <div className="auth-page">
            <div className="auth-bg" />

            <div className="auth-container">
                <div className="auth-left">
                    <div className="auth-brand">
                        <div className="auth-logo">TB</div>
                        <div>
                            <h1>TechnoBud</h1>
                            <p>Smart home appliances store</p>
                        </div>
                    </div>

                    <div className="auth-hero">
                        <h2>Welcome back to your account</h2>
                        <p>
                            Sign in to view your orders, wishlist, and personal profile.
                        </p>
                    </div>

                    <div className="auth-tags">
                        <span>🔐 Secure login</span>
                        <span>📦 Orders tracking</span>
                        <span>❤️ Wishlist access</span>
                        <span>⚡ Fast checkout</span>
                    </div>
                </div>

                <div className="auth-right">
                    <LoginFormUI onSuccess={handleSuccess} />
                </div>
            </div>
        </div>
    )
}