import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
  
      const text = await res.text();  // get raw text response
      console.log('Raw response text:', text);  // log it
  
      const data = text ? JSON.parse(text) : null;  // parse only if not empty
  
      if (!res.ok) {
        // if backend sent error json, use message from it
        throw new Error(data?.error || 'Login failed');
      }
  
      const { token, user } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('email', user.email);
      navigate('/notes');
    } catch (err) {
      alert(err.message);
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
