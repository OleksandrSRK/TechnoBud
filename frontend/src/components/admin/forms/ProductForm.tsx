import type { ChangeEvent } from 'react'
import type { Category, Brand } from '../../../types/admin'

type ImageItem = { url: string; alt: string; isMain: boolean }

type Props = {
    formData: any
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
    imageList: ImageItem[]
    onImageChange: (index: number, field: string, value: string | boolean) => void
    onAddImage: () => void
    onRemoveImage: (index: number) => void
    categories: Category[]
    brands: Brand[]
}

export default function ProductForm({
                                        formData,
                                        onChange,
                                        imageList,
                                        onImageChange,
                                        onAddImage,
                                        onRemoveImage,
                                        categories,
                                        brands,
                                    }: Props) {
    return (
        <>
            <div className="field-group">
                <label>Product Name *</label>
                <input name="name" placeholder="e.g. Samsung Galaxy S24" value={formData.name ?? ''} onChange={onChange} required />
            </div>
            <div className="field-group">
                <label>SKU *</label>
                <input name="sku" placeholder="e.g. SAM-S24-001" value={formData.sku ?? ''} onChange={onChange} required />
            </div>
            <div className="field-group">
                <label>Slug *</label>
                <input name="slug" placeholder="e.g. galaxy-s24" value={formData.slug ?? ''} onChange={onChange} required />
            </div>
            <div className="field-group">
                <label>Short Description</label>
                <textarea name="shortDescription" placeholder="Short description of the product" value={formData.shortDescription ?? ''} onChange={onChange} />
            </div>
            <div className="field-group">
                <label>Full Description *</label>
                <textarea name="description" placeholder="Detailed description" value={formData.description ?? ''} onChange={onChange} />
            </div>
            <div className="field-group">
                <label>Price (UAH) *</label>
                <input name="price" type="number" step="0.01" placeholder="19999.99" value={formData.price ?? ''} onChange={onChange} required />
            </div>
            <div className="field-group">
                <label>Old Price (optional)</label>
                <input name="oldPrice" type="number" step="0.01" placeholder="21999.99" value={formData.oldPrice ?? ''} onChange={onChange} />
            </div>
            <div className="field-group">
                <label>Stock Quantity *</label>
                <input name="stock" type="number" placeholder="100" value={formData.stock ?? ''} onChange={onChange} />
            </div>

            <div className="field-group">
                <label>Category *</label>
                <select name="categoryId" value={formData.categoryId ?? ''} onChange={onChange} required>
                    <option value="">-- Select category --</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="field-group">
                <label>Brand *</label>
                <select name="brandId" value={formData.brandId ?? ''} onChange={onChange} required>
                    <option value="">-- Select brand --</option>
                    {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
            </div>

            <label><input type="checkbox" name="isActive" checked={formData.isActive ?? true} onChange={onChange} /> Active</label>
            <label><input type="checkbox" name="isFeatured" checked={formData.isFeatured ?? false} onChange={onChange} /> Featured</label>

            <div className="field-group">
                <label>Warranty (months)</label>
                <input name="warrantyMonths" type="number" placeholder="12" value={formData.warrantyMonths ?? ''} onChange={onChange} />
            </div>
            <div className="field-group">
                <label>Power (W)</label>
                <input name="powerW" type="number" placeholder="500" value={formData.powerW ?? ''} onChange={onChange} />
            </div>
            <div className="field-group">
                <label>Energy Class</label>
                <input name="energyClass" placeholder="e.g. A++" value={formData.energyClass ?? ''} onChange={onChange} />
            </div>
            <div className="field-group">
                <label>Color</label>
                <input name="color" placeholder="e.g. Phantom Black" value={formData.color ?? ''} onChange={onChange} />
            </div>
            <div className="field-group">
                <label>Material</label>
                <input name="material" placeholder="e.g. Stainless Steel" value={formData.material ?? ''} onChange={onChange} />
            </div>
            <div className="field-group">
                <label>Weight (kg)</label>
                <input name="weightKg" type="number" step="0.01" placeholder="0.5" value={formData.weightKg ?? ''} onChange={onChange} />
            </div>

            <fieldset className="admin-images-section">
                <legend>Product Images (URLs)</legend>
                {imageList.map((img, idx) => (
                    <div key={idx} className="admin-image-row">
                        <input
                            placeholder="Image URL (e.g. /images/phone.jpg)"
                            value={img.url || ''}
                            onChange={e => onImageChange(idx, 'url', e.target.value)}
                            required
                        />
                        <input
                            placeholder="Alt text (optional)"
                            value={img.alt || ''}
                            onChange={e => onImageChange(idx, 'alt', e.target.value)}
                        />
                        <label>
                            <input
                                type="checkbox"
                                checked={img.isMain || false}
                                onChange={e => onImageChange(idx, 'isMain', e.target.checked)}
                            />
                            Main
                        </label>
                        <button type="button" onClick={() => onRemoveImage(idx)} className="admin-btn-delete">✕</button>
                    </div>
                ))}
                <button type="button" onClick={onAddImage} className="admin-btn-add">+ Add Image</button>
            </fieldset>
        </>
    )
}