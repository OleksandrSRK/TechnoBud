import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChangeEvent, FormEvent } from 'react'
import '../styles/AdminPage.css'
import type { User, Product, Category, Brand, Order, Filters } from '../types/admin'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminToolbar from '../components/admin/AdminToolbar'
import AdminModal from '../components/admin/AdminModal'
import UsersTable from '../components/admin/tables/UsersTable'
import ProductsTable from '../components/admin/tables/ProductsTable'
import CategoriesTable from '../components/admin/tables/CategoriesTable'
import BrandsTable from '../components/admin/tables/BrandsTable'
import OrdersTable from '../components/admin/tables/OrdersTable'
import UserForm from '../components/admin/forms/UserForm'
import ProductForm from '../components/admin/forms/ProductForm'
import CategoryForm from '../components/admin/forms/CategoryForm'
import BrandForm from '../components/admin/forms/BrandForm'

const API = 'http://localhost:3000'

export default function AdminPage() {
    const navigate = useNavigate()
    const savedTab = sessionStorage.getItem('adminTab') as 'users' | 'products' | 'categories' | 'brands' | 'orders' | null
    const [tab, setTab] = useState<'users' | 'products' | 'categories' | 'brands' | 'orders'>(savedTab || 'users')

    const [users, setUsers] = useState<User[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [brands, setBrands] = useState<Brand[]>([])
    const [orders, setOrders] = useState<Order[]>([])

    const [filters, setFilters] = useState<Filters>({})
    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [formData, setFormData] = useState<any>({})
    const [saveError, setSaveError] = useState('')
    const [imageList, setImageList] = useState<any[]>([])

    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    useEffect(() => { if (role !== 'ADMIN') navigate('/') }, [role, navigate])

    useEffect(() => {
        sessionStorage.setItem('adminTab', tab)
    }, [tab])

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

    const loadUsers = async () => {
        const res = await fetch(`${API}/users`, { headers })
        if (res.ok) setUsers(await res.json())
    }
    const loadProducts = async () => {
        const res = await fetch(`${API}/products/all?include=images,category,brand`, { headers })
        if (res.ok) setProducts(await res.json())
    }
    const loadCategories = async () => {
        const res = await fetch(`${API}/categories?all=true`, { headers })
        if (res.ok) setCategories(await res.json())
    }
    const loadBrands = async () => {
        const res = await fetch(`${API}/brands?all=true`, { headers })
        if (res.ok) setBrands(await res.json())
    }
    const loadOrders = async () => {
        const res = await fetch(`${API}/orders/all?include=items`, { headers })
        if (res.ok) setOrders(await res.json())
    }

    useEffect(() => {
        if (role !== 'ADMIN') return
        loadUsers(); loadProducts(); loadCategories(); loadBrands(); loadOrders()
    }, [role])

    const applyFilters = <T extends Record<string, any>>(list: T[], fields: string[]) => {
        return list.filter(item =>
            fields.every(field => {
                const filterVal = filters[field]
                if (!filterVal) return true
                const itemVal = (item[field] ?? '').toString().toLowerCase()
                return itemVal.includes(filterVal.toLowerCase())
            })
        )
    }

    const filteredUsers = applyFilters(users, ['id', 'fullName', 'email', 'phone', 'role'])
    const filteredProducts = applyFilters(products, ['id', 'name', 'sku'])
    const filteredCategories = applyFilters(categories, ['id', 'name', 'slug'])
    const filteredBrands = applyFilters(brands, ['id', 'name', 'slug'])
    const filteredOrders = applyFilters(orders, ['id', 'orderNumber', 'customerName'])

    const setFilter = (col: string, value: string) => setFilters(prev => ({ ...prev, [col]: value }))

    const openCreateModal = (defaults: any = {}) => {
        setEditingId(null)
        setFormData(defaults)
        setSaveError('')
        setImageList(defaults.images || [])
        setModalOpen(true)
    }

    const openEditModal = (item: any) => {
        setEditingId(item.id)
        setFormData({ ...item })
        setSaveError('')
        setImageList(item.images || [])
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditingId(null)
        setFormData({})
        setSaveError('')
    }

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        setFormData((prev: any) => ({ ...prev, [name]: val }))
    }

    const handleImageChange = (index: number, field: string, value: string | boolean) => {
        const updated = [...imageList]
        if (field === 'isMain' && value) {
            updated.forEach((img, i) => {
                if (i !== index) img.isMain = false
            })
        }
        updated[index] = { ...updated[index], [field]: value }
        setImageList(updated)
    }

    const addImage = () => {
        setImageList([...imageList, { url: '', alt: '', isMain: imageList.length === 0 }])
    }

    const removeImage = (index: number) => {
        setImageList(imageList.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaveError('')
        const url = editingId ? `${API}/${tab}/${editingId}` : `${API}/${tab}`
        const method = editingId ? 'PUT' : 'POST'

        const body = { ...formData }
        delete body.id
        delete body.createdAt
        delete body.updatedAt
        delete body.category
        delete body.brand
        delete body.images

        if (tab === 'products') {
            body.images = imageList.map(img => ({
                url: img.url,
                alt: img.alt || null,
                isMain: img.isMain || false,
            }))
        }

        const res = await fetch(url, { method, headers, body: JSON.stringify(body) })
        if (res.ok) {
            closeModal()
            switch (tab) {
                case 'users': loadUsers(); break
                case 'products': loadProducts(); break
                case 'categories': loadCategories(); break
                case 'brands': loadBrands(); break
                case 'orders': loadOrders(); break
            }
        } else {
            const data = await res.json().catch(() => ({ message: 'Unknown error' }))
            setSaveError(data.message || 'Save failed')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return
        await fetch(`${API}/${tab}/${id}`, { method: 'DELETE', headers })
        switch (tab) {
            case 'users': loadUsers(); break
            case 'products': loadProducts(); break
            case 'categories': loadCategories(); break
            case 'brands': loadBrands(); break
        }
    }

    const handleToggleActive = async (id: number, current: boolean) => {
        await fetch(`${API}/${tab}/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ isActive: !current })
        })
        switch (tab) {
            case 'users': loadUsers(); break
            case 'categories': loadCategories(); break
            case 'brands': loadBrands(); break
            case 'products': loadProducts(); break
        }
    }

    const handleUpdateOrderStatus = async (id: number, status: string) => {
        await fetch(`${API}/orders/${id}/status`, { method: 'PATCH', headers, body: JSON.stringify({ status }) })
        loadOrders()
    }

    if (role !== 'ADMIN') return null

    const renderForm = () => {
        switch (tab) {
            case 'users': return <UserForm formData={formData} onChange={handleFormChange} />
            case 'products':
                return (
                    <ProductForm
                        formData={formData}
                        onChange={handleFormChange}
                        imageList={imageList}
                        onImageChange={handleImageChange}
                        onAddImage={addImage}
                        onRemoveImage={removeImage}
                        categories={categories}
                        brands={brands}
                    />
                )
            case 'categories': return <CategoryForm formData={formData} onChange={handleFormChange} />
            case 'brands': return <BrandForm formData={formData} onChange={handleFormChange} />
            default: return null
        }
    }

    const renderTable = () => {
        switch (tab) {
            case 'users': return <UsersTable users={filteredUsers} filters={filters} onFilterChange={setFilter} onEdit={openEditModal} onToggleActive={handleToggleActive} onDelete={handleDelete} />
            case 'products': return <ProductsTable products={filteredProducts} filters={filters} onFilterChange={setFilter} onEdit={openEditModal} onToggleActive={handleToggleActive} onDelete={handleDelete} />
            case 'categories': return <CategoriesTable categories={filteredCategories} filters={filters} onFilterChange={setFilter} onEdit={openEditModal} onToggleActive={handleToggleActive} onDelete={handleDelete} />
            case 'brands': return <BrandsTable brands={filteredBrands} filters={filters} onFilterChange={setFilter} onEdit={openEditModal} onToggleActive={handleToggleActive} onDelete={handleDelete} />
            case 'orders': return <OrdersTable orders={filteredOrders} filters={filters} onFilterChange={setFilter} onStatusChange={handleUpdateOrderStatus} />
            default: return null
        }
    }

    return (
        <div className="admin-page">
            <AdminSidebar tab={tab} onTabChange={(t) => { setTab(t); setFilters({}) }} />
            <div className="admin-content">
                <AdminToolbar title={tab.charAt(0).toUpperCase() + tab.slice(1)} showAdd={tab !== 'orders'} onAdd={() => openCreateModal({})} />
                {renderTable()}
            </div>
            <AdminModal open={modalOpen} onClose={closeModal}>
                <h3>{editingId ? 'Edit' : 'Create'} {tab.slice(0, -1)}</h3>
                {saveError && <div className="admin-error">{saveError}</div>}
                <form onSubmit={handleSubmit}>
                    {renderForm()}
                    <div className="admin-modal-actions">
                        <button type="submit">{editingId ? 'Save' : 'Create'}</button>
                        <button type="button" onClick={closeModal}>Cancel</button>
                    </div>
                </form>
            </AdminModal>
        </div>
    )
}