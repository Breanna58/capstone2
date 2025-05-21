async function init() {
  try {
    await client.connect();
    console.log("connected to database");

    // Create users and notes tables
    let SQL = `
      DROP TABLE IF EXISTS users;
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );

      DROP TABLE IF EXISTS notes;
      CREATE TABLE notes(
          id SERIAL PRIMARY KEY,
          text VARCHAR(255),
          ranking INTEGER DEFAULT 3 NOT NULL,  
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now()
      );
    `;
    await client.query(SQL);
    console.log("tables created");

    // Seed users table with hashed password
    const hashedPassword = await bcrypt.hash("breanaa", 10);
    SQL = `
      INSERT INTO users(email, password) VALUES ($1, $2);
    `;
    await client.query(SQL, ['breanna@gmail.com', hashedPassword]);
    console.log("users seeded");

    // Seed notes table with sample data
    SQL = `
      INSERT INTO notes(text, ranking) VALUES('Make RESTful API', 5);
      INSERT INTO notes(ranking, text) VALUES(4, 'Create a POST endpoint');
      INSERT INTO notes(text) VALUES('Create a GET endpoint');
    `;
    await client.query(SQL);
    console.log("notes seeded");

    const port = process.env.PORT || 3000;
    server.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (error) {
    console.error("Error during init:", error);
  }
}
