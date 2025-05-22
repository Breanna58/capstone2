//check if user is authenticated 

const jwt = require('jsonwebtoken'); 

function requireToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });
  
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: "Malformed Authorization header" });
    }
  
    const token = parts[1];
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      req.user = decoded;
      next();
    } catch (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
    }
  }
  
  function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    next();
  }
  
  // Create a new product
  server.post('/api/products', requireToken, requireAdmin, async (req, res, next) => {
    try {
      const { name, description, price } = req.body;
      if (!name || !price) {
        return res.status(400).json({ error: 'Name and price are required' });
      }
      const result = await client.query(
        'INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *',
        [name, description, price]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  });
  
  // Edit product
  server.put('/api/products/:id', requireToken, requireAdmin, async (req, res, next) => {
    try {
      const productId = req.params.id;
      const { name, description, price } = req.body;
      const result = await client.query(
        'UPDATE products SET name=$1, description=$2, price=$3, updated_at=now() WHERE id=$4 RETURNING *',
        [name, description, price, productId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete product
  server.delete('/api/products/:id', requireToken, requireAdmin, async (req, res, next) => {
    try {
      const productId = req.params.id;
      await client.query('DELETE FROM products WHERE id=$1', [productId]);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
  // Get all products (admins only)
  server.get('/api/products/all', requireToken, requireAdmin, async (req, res, next) => {
    try {
      const result = await client.query('SELECT * FROM products ORDER BY id');
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  });
  
module.exports = requireToken
