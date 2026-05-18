import { Heart, Star } from 'lucide-react'
import './ProductCard.css'

type Product = {
    id: number
    name: string
    price: number
    category: string
    imageUrl?: string | null
    oldPrice?: number | null
    rating?: number | null
    brand?: string | null
}

type Props = {
    product: Product
}

export default function ProductCard({ product }: Props) {
    return (
        <article className="tb-card">
            <div className="tb-card-image">
                <div className="tb-image-placeholder">
                    {product.category}
                </div>
            </div>

            <div className="tb-card-body">
                <h3 className="tb-card-title">{product.name}</h3>

                <div className="tb-rating">
                    <Star size={14} />
                    {product.rating?.toFixed(1) ?? '4.8'}
                </div>

                <div className="tb-prices">
                    <div className="tb-price">{product.price.toLocaleString('uk-UA')} ₴</div>
                    {product.oldPrice ? (
                        <div className="tb-old-price">{product.oldPrice.toLocaleString('uk-UA')} ₴</div>
                    ) : null}
                </div>

                <div className="tb-card-footer">
                    <button type="button" className="tb-buy-btn">Add to cart</button>
                    <button type="button" className="tb-fav-btn">
                        <Heart size={16} />
                    </button>
                </div>
            </div>
        </article>
    )
}