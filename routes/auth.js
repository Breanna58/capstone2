const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { client } = require("../server/db");

// REGISTER route
router.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      console.log("Login request:", email, password);
  
      const result = await client.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
      );
  
      console.log("User lookup result:", result.rows);
  
      const user = result.rows[0];
  
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "1h" }
      );
  
      res.status(200).json({
        message: "Login successful!",
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (err) {
      console.error("Login route error:", err);
      next(err);
    }
  });
  

// LOGIN route
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("Login request:", email, password);

    const result = await client.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
      
    );


    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
