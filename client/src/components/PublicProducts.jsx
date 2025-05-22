import { useEffect, useState } from 'react';

function PublicProducts() {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch('http://localhost:3000/api/products');
      const data = await res.json();
      setProducts(data);
    }

    fetchProducts();
  }, []);

  // Fetch favorites only if logged in
  useEffect(() => {
    if (!token) return;

    async function fetchFavorites() {
      try {
        const res = await fetch('/api/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch favorites');
        const data = await res.json();
        setFavorites(data.map(fav => fav.productId)); // Assuming response has productId
      } catch (err) {
        console.error(err);
      }
    }

    fetchFavorites();
  }, [token]);

  const handleAddToCart = async (product) => {
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      alert(`Added ${product.name} to cart`);
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleFavorite = async (productId) => {
    if (!token) {
      alert('Please log in to save favorites');
      return;
    }

    try {
      if (favorites.includes(productId)) {
        // Remove from favorites
        const res = await fetch(`/api/favorites/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to remove favorite');
        setFavorites(favorites.filter(id => id !== productId));
      } else {
        // Add to favorites
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        });
        if (!res.ok) throw new Error('Failed to add favorite');
        setFavorites([...favorites, productId]);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1>All Products</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {products.map(product => {
          const isFavorite = favorites.includes(product.id);
          return (
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
              <button onClick={() => handleAddToCart(product)}>Add to Cart</button>
              {token && (
                <button
                  onClick={() => toggleFavorite(product.id)}
                  style={{ marginLeft: '0.5rem', backgroundColor: isFavorite ? 'gold' : 'lightgray' }}
                >
                  {isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PublicProducts;
