const pg = require("pg");
const express = require("express");
const morgan = require("morgan"); //logs http request to console in a consise format 
const authRoutes = require("../routes/auth"); 
//add all files used here!!!



const server = express(); 

server.use(require("morgan")("dev")); //logs the requests received to the server
server.use(express.json());
server.use("/api/auth", authRoutes);




//create client to connect to the database
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/capstone"
);

//create the express server


//function to create our database table, seed data into the tables when first starting the server
async function init() {
  //wait for the client to connect to the database
  await client.connect();
  console.log("connected to database");

  //create SQL to wipe the database and create a new table based on our schema
  let SQL = `
    DROP TABLE IF EXISTS notes;
    CREATE TABLE notes(
        id SERIAL PRIMARY KEY,
        text VARCHAR(255),
        ranking INTEGER DEFAULT 3 NOT NULL, 
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
    );
  `;

  //wait for the database to process the query
  await client.query(SQL);
  console.log("tables created");

  //create SQL statement to insert 3 new rows of data into our table
  SQL = `
    INSERT INTO notes(txt, ranking) VALUES('Make RESTful API', 5);
    INSERT INTO notes(ranking, txt) VALUES(4, 'Create a POST endpoint');
    INSERT INTO notes(txt) VALUES('Create a GET endpoint');
  `;

  //wait for the database to process the query
  await client.query(SQL);
  console.log("data seeded");

  //have the server listen on a port
  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`Server listening on port ${port}`));
}

//call the function so the server can start
init();



//endpoints CRUD
//C - CREATE --> POST
//R - READ --> GET
//U - UPDATE --> PUT
//D - DELETE --> DELETE

//CREATE - adds a new note to the table
server.post("/api/notes", async (req, res, next) => {
  try {
    //create the SQL query to create a new note based on the information in the request body
    const SQL = `INSERT INTO notes(text) VALUES($1) RETURNING *;`;
    //await the response from the client querying the database
    const response = await client.query(SQL, [req.body.txt]);
    //send the response
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

//READ - returns an array of note objects
server.get("/api/notes", async (req, res, next) => {
  try {
    //create the SQL query to select all the notes in descending order based on when they were created
    const SQL = `SELECT * FROM notes ORDER BY created_at DESC;`;
    //await the response from the client querying the database
    const response = await client.query(SQL);
    //send the response. If no status code is given express will send 200 by default
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

//UPDATE - edits a note based on the id passed and information within the request body
server.put("/api/notes/:id", async (req, res, next) => {
  try {
    //create the SQL query to update the note with the selected id
    const SQL = `UPDATE notes SET txt=$1, ranking=$2, updated_at=now() WHERE id=$3 RETURNING *;`;
    //await the response from the client querying the database
    const response = await client.query(SQL, [
      req.body.txt,
      req.body.ranking,
      req.params.id,
    ]);
    //send the response. If no status code is given express will send 200 by default
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

//DELETE
server.delete("/api/notes/:id", async (req, res, next) => {
  try {
    //create the SQL query to delete a note by id
    const SQL = `DELETE FROM notes WHERE id=$1;`;
    //await the response from the client querying the database
    await client.query(SQL, [req.params.id]);
    //send the response with a status code of 204 No Content
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// Error handler middleware
server.use((err, req, res, next) => {
  console.error(err.stack); // Log the full error
  res.status(500).send("Something went wrong!");
});
