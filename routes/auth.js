const express = require("express"); 
const router = express.Router(); 
const jwt = require("jsonwebtoken"); 
const bcrypt = require("bcrypt"); 
const { client } = require("../db");




//this is an HTTP post route 
router.post("/register", async (req, res, next) => {


    try {
        const { email, password } = req.body;

        //checking to see if client exists 
        const userExists = await client.query(
            "SELECT * FROM users WHERE email=$1", 
            [email]
        ); if (userExists.rows.length > 0) {

            return res.status(400).send("user already exists"); 

        }
        const hashedPassword = await bcrypt.hash(password, 10); 

        const result = await client.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hashedPassword]
        );

        //success response with user info:

        res.status(201).json({
            message: "user created sucessfully!", 
            user: {
                id: result.rows[0].id, 
                email: result.rows[0].email


            }



        }); 

    } catch (err) {
        next(err); 


    }


}); 

router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const result = await client.query(
            "SELECT * FROM users WHERE email=$1", 
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(400).send("Invalid email or password");
        }

        // Compare password with hashed password in the database
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).send("Invalid email or password");
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, "your_jwt_secret", {
            expiresIn: "1h"  // token expiration time
        });

        // thus sends token back 
        res.status(200).json({
            message: "Login successful!",
            token
        });

    } catch (err) {
        next(err);  
    }
});

module.exports = router;