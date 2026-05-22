export type User = {
    id: number; email: string; fullName: string; phone?: string; role: string; isActive: boolean; createdAt: string
}

export type ProductImage = {
    id: number; url: string; alt?: string; sortOrder: number; isMain: boolean
}

export type Product = {
    id: number; sku: string; slug: string; name: string; shortDescription?: string; description?: string
    price: number; oldPrice?: number; currency: string; stock: number; isActive: boolean; isFeatured: boolean
    categoryId: number; brandId: number; images: ProductImage[]
    category?: { id: number; name: string }; brand?: { id: number; name: string }
    warrantyMonths?: number; powerW?: number; energyClass?: string; color?: string; material?: string; weightKg?: number
}

export type Category = {
    id: number; name: string; slug: string; description?: string; imageUrl?: string; isActive: boolean; parentId?: number
}

export type Brand = {
    id: number
    name: string
    slug: string
    logoUrl?: string
    websiteUrl?: string
    description?: string
    isActive: boolean
}

export type Order = {
    id: number; orderNumber: string; status: string; totalAmount: number; customerName: string; customerEmail: string; customerPhone: string; shippingAddress: string; createdAt: string
    items?: { id: number; productNameSnapshot: string; quantity: number; unitPrice: number }[]
}

export type Filters = { [key: string]: string }