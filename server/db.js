const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgres://localhost:5432/capstone"
});



module.exports = { client };
