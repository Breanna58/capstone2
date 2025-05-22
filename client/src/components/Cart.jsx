// client/src/components/Cart.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });

  useEffect(() => {
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

    fetchCart();
  }, []);

  return (
    <div>
      <h2>Your Cart</h2>
      {cart.items.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <ul>
          {cart.items.map((item) => (
            <li key={item.cart_item_id}>
              {item.name} - {item.quantity} x ${item.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cart;
