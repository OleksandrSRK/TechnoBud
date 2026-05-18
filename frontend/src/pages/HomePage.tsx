import { useEffect, useMemo, useState } from 'react'
import ProductCard from '../components/products/ProductCard'
import '../styles/home.css'

type Product = {
    id: number
    name: string
    price: number
    category: string
    imageUrl?: string | null
    oldPrice?: number | null
    rating?: number | null
}

const categories = [
    'All categories',
    'Refrigerators',
    'Washing machines',
    'Small appliances',
    'Cleaning',
    'Climate',
    'Computers',
    'Accessories',
]

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('All categories')


    useEffect(() => {
        const loadProducts = async () => {
            try {
                const res = await fetch('http://localhost:3000/products')
                const data = await res.json()
                setProducts(data)
            } catch (error) {
                console.error('Failed to load products:', error)
            } finally {
                setLoading(false)
            }
        }

        loadProducts()
    }, [])

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesCategory =
                selectedCategory === 'All categories' ||
                product.category.toLowerCase().includes(
                    selectedCategory.toLowerCase().replace(/\s/g, '')
                )

            return matchesCategory
        })
    }, [products, selectedCategory])

    return (
        <div className="home-page">
            <main className="home-main">
                <section className="home-banner">
                    <div className="home-banner-content">
                        <span className="home-banner-badge">Special offer</span>
                        <h1>Everything for your home in one place</h1>
                        <p>
                            Browse refrigerators, washing machines, and other appliances.
                            Fast search, easy category navigation, and products loaded from the database.
                        </p>
                    </div>
                </section>

                <section className="home-layout">
                    <aside className="home-sidebar">
                        <h2>Categories</h2>
                        <div className="home-categories">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    className={`home-category-btn ${
                                        selectedCategory === category ? 'active' : ''
                                    }`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </aside>

                    <section className="home-products">
                        <div className="home-products-top">
                            <div>
                                <h2>Products</h2>
                                <p>Loaded from database</p>
                            </div>
                            <div className="home-count">{filteredProducts.length} items</div>
                        </div>

                        {loading ? (
                            <div className="home-empty">Loading products...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="home-empty">No products found.</div>
                        ) : (
                            <div className="home-grid">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </section>
                </section>
            </main>
        </div>
    )
}