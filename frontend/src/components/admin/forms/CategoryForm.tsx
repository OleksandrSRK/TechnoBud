import React, { useState } from 'react'
import type { Category } from '../../../types/admin'

type Props = {
    formData: any
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
    categories: Category[]
}

function generateSlug(name: string) {
    return name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

export default function CategoryForm({ formData, onChange, categories }: Props) {
    const [autoSlug, setAutoSlug] = useState(true)

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e)
        if (autoSlug) {
            const slug = generateSlug(e.target.value)
            onChange({ target: { name: 'slug', value: slug } } as React.ChangeEvent<HTMLInputElement>)
        }
    }

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAutoSlug(false)
        onChange(e)
    }

    return (
        <>
            <div className="field-group">
                <label>Category Name *</label>
                <input name="name" placeholder="e.g. Washing Machines" value={formData.name ?? ''} onChange={handleNameChange} required />
            </div>
            <div className="field-group">
                <label>Slug *</label>
                <input name="slug" placeholder="e.g. washing-machines" value={formData.slug ?? ''} onChange={handleSlugChange} required />
            </div>
            <div className="field-group">
                <label>Parent Category</label>
                <select name="parentId" value={formData.parentId ?? ''} onChange={onChange}>
                    <option value="">-- None (top-level) --</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
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