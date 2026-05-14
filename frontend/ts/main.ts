const API_URL = "http://localhost:3000/products";

type Product = {
    id: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    currency: string;
    description: string;
    imageUrl: string;
    rating: number;
    inStock: boolean;
};

async function loadProducts() {
    const res = await fetch(API_URL);
    const products: Product[] = await res.json();

    renderProducts(products);
}

function renderProducts(products: Product[]) {
    const container = document.getElementById("products") as HTMLElement;

    container.innerHTML = "";

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}" class="card-img"/>

            <div class="card-body">
                <h3 class="card-title">${product.name}</h3>
                
                <p class="card-brand">${product.brand}</p>
                <p class="card-category">${product.category}</p>

                <p class="card-description">
                    ${product.description.slice(0, 100)}...
                </p>

                <div class="card-bottom">
                    <span class="price">
                        ${product.price} ${product.currency}
                    </span>

                    <span class="rating">
                        ⭐ ${product.rating}
                    </span>
                </div>

                <div class="stock ${product.inStock ? 'in' : 'out'}">
                    ${product.inStock ? 'В наявності' : 'Немає в наявності'}
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

loadProducts();