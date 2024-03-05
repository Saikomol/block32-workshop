const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_acme_icecream_db')
const app = express();
app.use(express.json());
app.use(require('morgan')('dev'));

app.post('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
            INSERT INTO flavors(txt, ranking)
            VALUES($1, $2)
            RETURNING *;
        `;
        const response = await client.query(SQL, [req.body.txt, req.body.ranking])
        res.send(response.rows[0]);
    } catch (ex) {
        next(ex);
    }
});
app.get('/api/flavors', async (req, res, next) => {
    try{
        const SQL = `
        SELECT * from flavors ORDER BY created_at DESC;
        `;
        const response = await client.query(SQL)
        res.send(response.rows);
    }catch(ex){
        next(ex);
    }
});
app.get('/api/flavors/:id', async (req, res, next) => {
    // This route handler is invoked when a GET request is made to '/api/flavors/:id'
    try {
        // Inside a try block to catch any potential errors
        const flavorId = req.params.id; // Extract the flavor ID from the request parameters
        const SQL = `
            SELECT * FROM flavors WHERE id = $1;
        `;
        // SQL query to select flavor information based on the provided ID
        const response = await client.query(SQL, [flavorId]); // Execute the SQL query
        res.send(response.rows); // Send the response containing the flavor information to the client
    } catch (ex) {
        // If any error occurs during execution, it's caught here
        next(ex); // Pass the error to the error handling middleware
    }
});
app.put('/api/flavors/:id', async (req, res, next) => {
    try{
        const SQL = `
        UPDATE flavors

        SET txt=$1, ranking=$2, upated_at=now()

        WHERE id=$3 RETURNING *;
        `;
        const response = await client.query(SQL [req.body.txt, req.body.ranking, req.params.id]);
        res.send(response.rows[0]);
    }catch(ex){
        next(ex);
    }
});
app.delete('/api/flavors/:id', async (req, res, next) => {
    try{
        const SQL = `
        DELETE from flavors
        WHERE id = $1;
        `;
        const response = await client.query(SQL, [req.params.id])
        res.sendStatus(204);
    }catch(ex){
        next(ex);
    }
});

const init = async()=>{
    console.log("connecting to DATABASE");
    await client.connect();
    console.log("connected to DATABASE" );
   


    let SQL =`
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    ranking INTEGER DEFAULT 3 NOT NULL,
    txt VARCHAR(255) NOT NULL
    );
    `;
    
    await client.query(SQL);
    console.log('tables flavors created');
    SQL = `
    INSERT INTO flavors(txt, ranking) VALUES('Strawberry', 5);
    INSERT INTO flavors(txt, ranking) VALUES('Vanilla', 4);
    INSERT INTO flavors(txt, ranking) VALUES('Chocolate', 2); 
    `;
    await client.query(SQL);
    console.log('data seeded');
  
    const port = process.env.PORT || 3000;

app.listen(port, () => {
console.log(`listening on port ${port}`);
console.log(`curl localhost:${port}/api/flavors`);
    })
    
};

init();