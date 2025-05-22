import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(response.data);
    } catch (error) {
      console.error("Error fetching cart", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemoveItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to remove item");
      await fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (!response.ok) throw new Error("Failed to update quantity");
      await fetchCart();
    } catch (error) {
      console.error("Error updating quantity", error);
    }
  };

  return (
    <div>
      <h2>Your Cart</h2>
      {cart.items.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <ul>
          {cart.items.map((item) => (
            <li key={item.cart_item_id}>
              <strong>{item.name}</strong> - ${item.price} each<br />
              Quantity:{" "}
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  handleQuantityChange(item.cart_item_id, parseInt(e.target.value))
                }
              />
              <button onClick={() => handleRemoveItem(item.cart_item_id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cart;
