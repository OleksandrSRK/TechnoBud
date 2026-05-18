import { useNavigate } from 'react-router-dom'
import RegistrationFormUI from '../components/auth/RegistrationFormUI'
import '../components/auth/RegistrationFormUI.css'

type Props = {
    setIsLoggedIn: (value: boolean) => void
}

export default function RegisterPage({ setIsLoggedIn }: Props) {
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
                        <h2>Everything for your home in one place</h2>
                        <p>
                            Buy refrigerators, washing machines and kitchen appliances
                            with fast delivery and warranty.
                        </p>
                    </div>

                    <div className="auth-tags">
                        <span>🔥 Discounts every day</span>
                        <span>🚚 Fast delivery</span>
                        <span>🛡 Warranty included</span>
                        <span>💳 Secure payment</span>
                    </div>
                </div>

                <div className="auth-right">
                    <RegistrationFormUI onSuccess={handleSuccess} />
                </div>
            </div>
        </div>
    )
}