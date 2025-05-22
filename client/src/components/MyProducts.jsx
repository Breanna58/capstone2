import { useEffect, useState } from "react";

function MyProducts() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const token = localStorage.getItem("token");

  // Fetch products (previously notes) from backend
  useEffect(() => {
    if (!token) return;
    fetch("/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        setProducts(data);
      })
      .catch((err) => {
        console.error(err);
        alert("Please log in to view products");
      });
  }, [token]);

  // Add a new product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newProduct }),
      });
      if (!res.ok) throw new Error("Failed to add product");
      const savedProduct = await res.json();
      setProducts([...products, savedProduct]);
      setNewProduct("");
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete product
  const handleDelete = async (productId) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 204) {
        setProducts(products.filter((p) => p.id !== productId));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete product");
      }
    } catch (err) {
      alert("Error deleting product");
    }
  };

  // Start editing
  const startEditing = (product) => {
    setEditingId(product.id);
    setEditedText(product.name);
  };

  // Save edited product
  const handleSave = async (productId) => {
    if (!editedText.trim()) {
      alert("Product name cannot be empty");
      return;
    }
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editedText }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update product");
      }
      const updatedProduct = await res.json();
      setProducts(products.map((p) => (p.id === productId ? updatedProduct : p)));
      setEditingId(null);
      setEditedText("");
    } catch (err) {
      alert(err.message);
    }
  };

  // Add product to cart
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
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add to cart');
      }
      
      alert(`Added ${product.name} to cart`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1>My Products</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={newProduct}
          onChange={(e) => setNewProduct(e.target.value)}
          placeholder="Write new product"
        />
        <button type="submit">Add Product</button>
      </form>

      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {editingId === product.id ? (
              <>
                <input
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                />
                <button onClick={() => handleSave(product.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {product.name}{" "}
                <button onClick={() => startEditing(product)}>Edit</button>
                <button onClick={() => handleDelete(product.id)}>Delete</button>
                <button onClick={() => handleAddToCart(product)}>Add to Cart</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyProducts;
