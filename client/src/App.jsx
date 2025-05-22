import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Notes from './components/Notes.jsx';
import Products from './components/Products.jsx';
import Navbar from './components/Navbar.jsx';
import PublicProducts from './components/PublicProducts.jsx';
import Cart from "./components/Cart";
import MyProducts from './components/MyProducts.jsx';

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const loggedIn = !!localStorage.getItem('token');

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/all-products" element={<PublicProducts />} />

        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />

        {/* Protected routes */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          }
        />

        {/* Your new MyProducts route here */}
        <Route
          path="/my-products"
          element={
            <ProtectedRoute>
              <MyProducts />
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to={loggedIn ? "/notes" : "/login"} />} />
      </Routes>
    </>
  );
}

export default App;
