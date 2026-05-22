import type { ChangeEvent } from 'react'

type Props = {
    formData: any
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export default function UserForm({ formData, onChange }: Props) {
    return (
        <>
            <div className="field-group">
                <label>Full Name *</label>
                <input name="fullName" placeholder="e.g. John Doe" value={formData.fullName ?? ''} onChange={onChange} required />
            </div>
            <div className="field-group">
                <label>Email *</label>
                <input name="email" type="email" placeholder="e.g. user@example.com" value={formData.email ?? ''} onChange={onChange} required />
            </div>
            <div className="field-group">
                <label>Phone</label>
                <input name="phone" placeholder="e.g. +380501234567" value={formData.phone ?? ''} onChange={onChange} />
            </div>
            <div className="field-group">
                <label>Role *</label>
                <select name="role" value={formData.role ?? 'CUSTOMER'} onChange={onChange}>
                    <option value="CUSTOMER">Customer</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>
            <label><input type="checkbox" name="isActive" checked={formData.isActive ?? true} onChange={onChange} /> Active</label>
        </>
    )
}