import { useEffect, useState } from 'react';

function PublicProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch('http://localhost:3000/api/products');
      const data = await res.json();
      console.log('Fetched products:', data);
      setProducts(data);
    }

    fetchProducts();
  }, []);

  return (
    <div>
      <h1>All Products</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {products.map(product => (
          <div
            key={product.id}
            style={{
              border: '1px solid #ccc',
              margin: '1rem',
              padding: '1rem',
              width: '200px',
            }}
          >
            <h3>{product.name}</h3>
            <p>${parseFloat(product.price).toFixed(2)}</p>
            <p>{product.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PublicProducts;
