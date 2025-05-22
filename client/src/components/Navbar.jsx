import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); 

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role'); 
    navigate('/login');
  }

  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
      <Link to="/all-products">All Products</Link>

      {token ? (
        <>
          {/* Links available to all authenticated users */}
          <Link to="/products">My Products</Link>
          <Link to="/notes">Notes</Link>
          <Link to="/cart">Cart</Link> 
          <Link to="/my-products">My Products</Link>


          {/* Admin-specific link */}
          {role === 'admin' && <Link to="/admin">Admin Dashboard</Link>}

          {/* Engineer-specific link */}
          {role === 'engineer' && <Link to="/engineer-tools">Engineer Tools</Link>}

          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
