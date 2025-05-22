import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = ({ token, userRole }) => {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  const [editingProductId, setEditingProductId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingPrice, setEditingPrice] = useState('');

  if (!token || userRole !== 'admin') {
    return <p>Access denied. Admins only.</p>;
  }

  useEffect(() => {
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

  const handleAddProduct = async () => {
    try {
      const response = await axios.post('/api/products', {
        name: newProductName,
        price: newProductPrice,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts([...products, response.data]);
      setNewProductName('');
      setNewProductPrice('');
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const startEditing = (product) => {
    setEditingProductId(product.id);
    setEditingName(product.name);
    setEditingPrice(product.price);
  };

  const saveEdit = async (id) => {
    try {
      const response = await axios.put(`/api/products/${id}`, {
        name: editingName,
        price: editingPrice,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.map(p => (p.id === id ? response.data : p)));
      setEditingProductId(null);
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <h2>Add New Product</h2>
      <input
        type="text"
        placeholder="Product Name"
        value={newProductName}
        onChange={(e) => setNewProductName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price"
        value={newProductPrice}
        onChange={(e) => setNewProductPrice(e.target.value)}
      />
      <button onClick={handleAddProduct}>Add Product</button>

      <h2>All Products</h2>
      {products.map((product) => (
        <div key={product.id} style={{ marginBottom: '1rem' }}>
          {editingProductId === product.id ? (
            <>
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
              />
              <input
                type="number"
                value={editingPrice}
                onChange={(e) => setEditingPrice(e.target.value)}
              />
              <button onClick={() => saveEdit(product.id)}>Save</button>
              <button onClick={() => setEditingProductId(null)}>Cancel</button>
            </>
          ) : (
            <>
              <strong>{product.name}</strong> — ${product.price}
              <br />
              <button onClick={() => startEditing(product)}>Edit</button>
              <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
            </>
          )}
        </div>
      ))}

      <h2>All Users</h2>
      {users.map((user) => (
        <div key={user.id} style={{ marginBottom: '1rem' }}>
          <strong>{user.name || user.email}</strong>
          <br />
          Email: {user.email}
          <br />
          Address: {user.address || 'N/A'}
          <br />
          Phone: {user.phone || 'N/A'}
          <br />
          Billing Info: {user.billingInfo || 'N/A'}
          <br />
          Role: {user.role}
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
