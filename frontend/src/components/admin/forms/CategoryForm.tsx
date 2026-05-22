import React from 'react'

type Props = {
    formData: any
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export default function CategoryForm({ formData, onChange }: Props) {
    return (
        <>
            <div className="field-group">
                <label>Category Name *</label>
                <input name="name" placeholder="e.g. Washing Machines" value={formData.name ?? ''} onChange={onChange} required />
            </div>
            <div className="field-group">
                <label>Slug *</label>
                <input name="slug" placeholder="e.g. washing-machines" value={formData.slug ?? ''} onChange={onChange} required />
            </div>
            <div className="field-group">
                <label>Description</label>
                <textarea name="description" placeholder="Short description" value={formData.description ?? ''} onChange={onChange} />
            </div>
            <div className="field-group">
                <label>Image URL</label>
                <input name="imageUrl" placeholder="e.g. /images/category.jpg" value={formData.imageUrl ?? ''} onChange={onChange} />
            </div>
            <label><input type="checkbox" name="isActive" checked={formData.isActive ?? true} onChange={onChange} /> Active</label>
        </>
    )
}