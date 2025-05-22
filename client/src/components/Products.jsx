import { useEffect, useState } from "react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const token = localStorage.getItem("token");

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
            {prod.name} - ${prod.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
