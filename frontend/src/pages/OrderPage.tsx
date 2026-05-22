import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/OrderPage.css'

const API = 'http://localhost:3000'

type Address = {
    id: number
    label?: string
    country: string
    city: string
    street: string
    house: string
    apartment?: string
    postalCode?: string
    isDefault: boolean
}

export default function OrderPage() {
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')

    const [name, setName] = useState(user?.fullName || '')
    const [phone, setPhone] = useState(user?.phone || '')
    const [email, setEmail] = useState(user?.email || '')
    const [addresses, setAddresses] = useState<Address[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
    const [newAddress, setNewAddress] = useState({
        city: '',
        street: '',
        house: '',
        apartment: '',
        postalCode: '',
    })
    const [showNewAddressForm, setShowNewAddressForm] = useState(false)
    const [notes, setNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }
        fetch(`${API}/addresses`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                setAddresses(data)
                const defaultAddr = data.find((a: Address) => a.isDefault)
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr.id)
                } else if (data.length > 0) {
                    setSelectedAddressId(data[0].id)
                }
                if (data.length === 0) {
                    setShowNewAddressForm(true)
                }
            })
            .catch(console.error)
    }, [token, navigate])

    const getShippingAddress = () => {
        if (showNewAddressForm) {
            const { city, street, house, apartment, postalCode } = newAddress
            if (!city || !street || !house) return ''
            return `${city}, ${street} ${house}${apartment ? `, ap. ${apartment}` : ''}${postalCode ? `, ${postalCode}` : ''}`
        }
        const addr = addresses.find(a => a.id === selectedAddressId)
        if (!addr) return ''
        return `${addr.city}, ${addr.street} ${addr.house}${addr.apartment ? `, ap. ${addr.apartment}` : ''}${addr.postalCode ? `, ${addr.postalCode}` : ''}`
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !phone || !email) return alert('Please fill in all contact fields')

        const shippingAddress = getShippingAddress()
        if (!shippingAddress) return alert('Please fill in the delivery address')

        setSubmitting(true)
        try {
            let addressId = selectedAddressId
            if (showNewAddressForm) {
                const res = await fetch(`${API}/addresses`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        city: newAddress.city,
                        street: newAddress.street,
                        house: newAddress.house,
                        apartment: newAddress.apartment || undefined,
                        postalCode: newAddress.postalCode || undefined,
                        country: 'Ukraine',
                    }),
                })
                if (res.ok) {
                    const newAddr = await res.json()
                    addressId = newAddr.id
                }
            }

            const res = await fetch(`${API}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    customerName: name,
                    customerPhone: phone,
                    customerEmail: email,
                    shippingAddress,
                    notes,
                    addressId,
                }),
            })

            if (res.ok) {
                const order = await res.json()
                window.dispatchEvent(new Event('cartUpdated'))
                navigate(`/orders/${order.id}`)
            } else {
                const data = await res.json()
                alert(data.message || 'Order creation failed')
            }
        } catch (err) {
            console.error(err)
            alert('An error occurred')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="order-page">
            <main className="order-main">
                <h2>Checkout</h2>
                <form className="order-form" onSubmit={handleSubmit}>
                    <div className="order-section">
                        <h3>Contact information</h3>
                        <div className="field-group">
                            <label>Full Name</label>
                            <input placeholder="e.g. John Doe" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="field-group">
                            <label>Phone</label>
                            <input placeholder="e.g. +380501234567" value={phone} onChange={e => setPhone(e.target.value)} required />
                        </div>
                        <div className="field-group">
                            <label>Email</label>
                            <input placeholder="e.g. user@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                    </div>

                    <div className="order-section">
                        <h3>Delivery address</h3>
                        {addresses.length > 0 && (
                            <div className="field-group">
                                <label>Saved addresses</label>
                                <select
                                    value={showNewAddressForm ? 'new' : selectedAddressId ?? ''}
                                    onChange={e => {
                                        if (e.target.value === 'new') {
                                            setShowNewAddressForm(true)
                                        } else {
                                            setSelectedAddressId(Number(e.target.value))
                                            setShowNewAddressForm(false)
                                        }
                                    }}
                                >
                                    {addresses.map(addr => (
                                        <option key={addr.id} value={addr.id}>
                                            {addr.city}, {addr.street} {addr.house}{addr.apartment ? `, ap. ${addr.apartment}` : ''}
                                        </option>
                                    ))}
                                    <option value="new">+ New address</option>
                                </select>
                            </div>
                        )}

                        {!showNewAddressForm && selectedAddressId && (
                            <div className="selected-address-display">
                                <strong>Selected:</strong> {getShippingAddress()}
                            </div>
                        )}

                        {showNewAddressForm && (
                            <div className="new-address-fields">
                                <div className="field-group">
                                    <label>City</label>
                                    <input placeholder="e.g. Kyiv" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                                </div>
                                <div className="field-group">
                                    <label>Street</label>
                                    <input placeholder="e.g. Khreshchatyk" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} required />
                                </div>
                                <div className="field-group">
                                    <label>House</label>
                                    <input placeholder="e.g. 25" value={newAddress.house} onChange={e => setNewAddress({ ...newAddress, house: e.target.value })} required />
                                </div>
                                <div className="field-group">
                                    <label>Apartment (optional)</label>
                                    <input placeholder="e.g. 42" value={newAddress.apartment} onChange={e => setNewAddress({ ...newAddress, apartment: e.target.value })} />
                                </div>
                                <div className="field-group">
                                    <label>Postal code (optional)</label>
                                    <input placeholder="e.g. 01001" value={newAddress.postalCode} onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="order-section">
                        <h3>Notes (optional)</h3>
                        <div className="field-group">
                            <label>Your notes</label>
                            <textarea
                                placeholder="Additional notes for the order"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="order-submit-btn" disabled={submitting}>
                        {submitting ? 'Placing order...' : 'Place order'}
                    </button>
                </form>
            </main>
        </div>
    )
}