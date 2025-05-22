import { useEffect, useState } from "react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const token = localStorage.getItem("token");

  // Add to cart handler
  const handleAddToCart = async (product) => {
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      alert(`Added ${product.name} to cart`);
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetch("/api/products", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => {
        console.error(err);
        alert("You must be logged in to see products");
      });
  }, [token]);

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map(prod => (
          <li key={prod.id}>
            {prod.name} - ${prod.price}{" "}
            <button onClick={() => handleAddToCart(prod)}>Add to Cart</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
