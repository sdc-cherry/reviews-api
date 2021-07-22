const express = require('express');
const app = express();
const port = 4444;

const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'postgres',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

client.connect((err) => {
  if (err) {
    console.log("Connection Failed: \n", err);
  } else {
    console.log("Connection Succeeded");
  }
});


app.get('/', (req, res) => {
  res.status(200).send("Server Up and Running!");
})

app.get('/reviews', (req, res) => {
  client.query('TODO;', (err, dbResponse) => {
    if (err) {
      res.status(400);
      res.send('Query to DB GET /reviews failed');
    }

    res.send(dbResponse);
    client.end();
  });
});

app.get('/reviews/meta', (req, res) => {
  client.query('TODO;', (err, dbResponse) => {
    if (err) {
      res.status(400);
      res.send('Query to DB GET /reviews/meta failed');
    }

    res.send(dbResponse);
    client.end();
  });
});

app.post('/reviews', (req, res) => {
  client.query('TODO;', (err, dbResponse) => {
    if (err) {
      res.status(400);
      res.send('Query to DB POST /reviews failed');
    }
    res.send(dbResponse);
    client.end();
  })
})

app.put('/reviews/:review_id/helpful', (req, res) => {
  client.query('TODO;', (err, dbResponse) => {
    if (err) {
      res.status(400);
      res.send('Query to DB PUT /reviews/:review_id/helpful failed');
    }
    res.send(dbResponse);
    client.end();
  });
);

app.put('/reviews/:review_id/report', (req, res) => {
  client.query('TODO;', (err, dbResponse) => {
    if (err) {
      res.status(400);
      res.send('Query to DB POST /reviews/:review_id/report failed');
    }
    res.send(dbResponse);
    client.end();
  });
);


app.listen(port, () => console.log(`Example app listening on port ${port}!`))