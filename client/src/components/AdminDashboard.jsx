import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch products and users (protected routes)
    const fetchData = async () => {
      try {
        const [productsRes, usersRes] = await Promise.all([
          axios.get('/api/products/all', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setProducts(productsRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <h2>All Products</h2>
      {products.map((product) => (
        <div key={product.id} style={{ marginBottom: '1rem' }}>
          <strong>{product.name}</strong> — ${product.price}
          <br />
          <button>Edit</button>
          <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
        </div>
      ))}

      <h2>All Users</h2>
      {users.map((user) => (
        <div key={user.id}>
          <strong>{user.email}</strong> — Role: {user.role}
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
