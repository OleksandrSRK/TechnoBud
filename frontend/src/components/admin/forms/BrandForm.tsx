import React from 'react'

type Props = {
    formData: any
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export default function BrandForm({ formData, onChange }: Props) {
    return (
        <>
            <div className="field-group">
                <label>Brand Name *</label>
                <input name="name" placeholder="e.g. Samsung" value={formData.name ?? ''} onChange={onChange} required />
            </div>
            <div className="field-group">
                <label>Slug *</label>
                <input name="slug" placeholder="e.g. samsung" value={formData.slug ?? ''} onChange={onChange} required />
            </div>
            <div className="field-group">
                <label>Description</label>
                <textarea name="description" placeholder="Short description" value={formData.description ?? ''} onChange={onChange} />
            </div>
            <div className="field-group">
                <label>Website URL</label>
                <input name="websiteUrl" placeholder="e.g. https://samsung.com" value={formData.websiteUrl ?? ''} onChange={onChange} />
            </div>
            <div className="field-group">
                <label>Logo URL</label>
                <input name="logoUrl" placeholder="e.g. /images/logo.png" value={formData.logoUrl ?? ''} onChange={onChange} />
            </div>
            <label><input type="checkbox" name="isActive" checked={formData.isActive ?? true} onChange={onChange} /> Active</label>
        </>
    )
}