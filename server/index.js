const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { requireToken, requireAdmin } = require("../routes/middleware");


const authRoutes = require("../routes/auth");
const adminRoutes = require("../routes/admin"); 


const { client } = require("./db");

const server = express();

server.use(cors());
server.use(morgan("dev"));
server.use(express.json());

server.use("/api/auth", authRoutes);
server.use("/api/admin", adminRoutes);

// CRUD endpoints
server.post("/api/notes", requireToken, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Note text is required" });
    }
    const SQL = `INSERT INTO notes(text) VALUES($1) RETURNING *;`;
    const response = await client.query(SQL, [text]);
    res.json(response.rows[0]);
  } catch (error) {
    next(error);
  }
});


server.get('/api/favorites', requireToken, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const favorites = await client.query(
      `SELECT product_id FROM favorites WHERE user_id = $1`,
      [userId]
    );

    res.json(favorites.rows);
  } catch (error) {
    next(error);
  }
});

// Get favorites for logged-in user
// server.get('/api/favorites', requireToken, async (req, res, next) => {
//   try {
//     const userId = req.user.id;
//     const result = await client.query(
//       `SELECT p.* FROM favorites f
//        JOIN products p ON f.product_id = p.id
//        WHERE f.user_id = $1`,
//       [userId]
//     );
//     res.json(result.rows);
//   } catch (error) {
//     next(error);
//   }
// });

// Add a product to favorites
server.post('/api/favorites', requireToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    const insert = await client.query(
      `INSERT INTO favorites(user_id, product_id) VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING *`,
      [userId, productId]
    );
    res.status(201).json(insert.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Remove a product from favorites
server.delete('/api/favorites/:productId', requireToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await client.query(
      `DELETE FROM favorites WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});





server.get('/api/admin/products', requireAdmin, async (req, res) => {
  const products = await getAllProducts();
  res.json(products);
});


server.get("/api/notes", requireToken, async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM notes ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

server.put("/api/notes/:id", requireToken, async (req, res) => {
  try {
    const { text, ranking } = req.body;
    const noteId = req.params.id;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Note text is required" });
    }

    const rankValue = ranking !== undefined ? parseInt(ranking, 10) : 3;
    if (isNaN(rankValue)) {
      return res.status(400).json({ error: "Ranking must be a number" });
    }

    const SQL = `UPDATE notes SET text=$1, ranking=$2, updated_at=now() WHERE id=$3 RETURNING *;`;
    const response = await client.query(SQL, [text, rankValue, noteId]);

    if (response.rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(response.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.get("/api/products", async (req, res, next) => {
  try {
    const result = await client.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});


server.get('/api/users', requireToken, requireAdmin, async (req, res, next) => {
  try {
    const result = await client.query(`
      SELECT id, email, role, created_at, updated_at
      FROM users ORDER BY id
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

server.get("/api/cart", requireToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartResult = await client.query(
      `SELECT * FROM carts WHERE user_id=$1 AND status='active' LIMIT 1`,
      [userId]
    );

    if (cartResult.rows.length === 0) {
      return res.json({ items: [] });
    }

    const cart = cartResult.rows[0];

    const itemsResult = await client.query(
      `
      SELECT ci.id as cart_item_id, ci.quantity, p.id as product_id, p.name, p.description, p.price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      `,
      [cart.id]
    );

    res.json({ cartId: cart.id, items: itemsResult.rows });
  } catch (error) {
    next(error);
  }
});

server.post("/api/cart/add", requireToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    let cartResult = await client.query(
      `SELECT * FROM carts WHERE user_id=$1 AND status='active' LIMIT 1`,
      [userId]
    );

    let cartId;
    if (cartResult.rows.length === 0) {
      const insertCart = await client.query(
        `INSERT INTO carts(user_id, status) VALUES ($1, 'active') RETURNING *`,
        [userId]
      );
      cartId = insertCart.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }

    const itemResult = await client.query(
      `SELECT * FROM cart_items WHERE cart_id=$1 AND product_id=$2`,
      [cartId, productId]
    );

    if (itemResult.rows.length > 0) {
      const newQty = itemResult.rows[0].quantity + quantity;
      const updateItem = await client.query(
        `UPDATE cart_items SET quantity=$1, updated_at=now() WHERE id=$2 RETURNING *`,
        [newQty, itemResult.rows[0].id]
      );
      res.json(updateItem.rows[0]);
    } else {
      const insertItem = await client.query(
        `INSERT INTO cart_items(cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *`,
        [cartId, productId, quantity]
      );
      res.json(insertItem.rows[0]);
    }
  } catch (error) {
    next(error);
  }
});

server.put("/api/cart/:itemId", requireToken, async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;
    const userId = req.user.id;

    const itemResult = await client.query(
      `
      SELECT ci.*, c.user_id FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.id=$1
      `,
      [itemId]
    );

    if (itemResult.rows.length === 0 || itemResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updateResult = await client.query(
      `
      UPDATE cart_items SET quantity=$1, updated_at=now()
      WHERE id=$2 RETURNING *
      `,
      [quantity, itemId]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    next(error);
  }
});

server.delete("/api/cart/:itemId", requireToken, async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const itemResult = await client.query(
      `
      SELECT ci.*, c.user_id FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.id=$1
      `,
      [itemId]
    );

    if (itemResult.rows.length === 0 || itemResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await client.query(`DELETE FROM cart_items WHERE id=$1`, [itemId]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Error handler
server.use((err, req, res, next) => {
  console.error("Error middleware:", err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});




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


// DB + table initialization

async function init() {
  try {
    await client.connect();
    console.log("connected to database");

    await client.query(`DROP TABLE IF EXISTS cart_items`);
    await client.query(`DROP TABLE IF EXISTS carts`);
    await client.query(`DROP TABLE IF EXISTS notes`);
    await client.query(`DROP TABLE IF EXISTS favorites`);
    await client.query(`DROP TABLE IF EXISTS products`);
    await client.query(`DROP TABLE IF EXISTS users`);

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT now(),
        UNIQUE(user_id, product_id)
      )
    `);

    await client.query(`
      CREATE TABLE notes (
        id SERIAL PRIMARY KEY,
        text VARCHAR(255),
        ranking INTEGER DEFAULT 3 NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE carts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `);

    console.log("tables created");

    const hashedPassword = await bcrypt.hash("breanna", 10);
    await client.query(
      `INSERT INTO users(email, password, role) VALUES ($1, $2, $3)`,
      ["breanna@gmail.com", hashedPassword, "admin"]
    );

    await client.query(`
      INSERT INTO products(name, description, price) VALUES
      ('Product 1', 'Description for product 1', 19.99),
      ('Product 2', 'Description for product 2', 29.99)
      ('Product 3', 'Description for product 2', 69.99)
    `);

    await client.query(`
      INSERT INTO notes(text, ranking) VALUES
      ('Make RESTful API', 5),
      ('Create a POST endpoint', 4),
      ('Create a GET endpoint', 3)
    `);

    const port = process.env.PORT || 3000;
    server.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (error) {
    console.error("Error during init:", error);
  }
}


init();

