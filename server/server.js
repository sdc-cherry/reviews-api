const express = require('express');
const app = express();
const port = 4444;

app.use(express.json());

const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack)
  }

  client.query('SELECT NOW()', (err, result) => {
    release()
    if (err) {
      return console.error('Error executing query', err.stack)
    }
    console.log(result.rows)
  })
});


app.get('/', (req, res) => {
  res.status(200).send("Server Up and Running!");
});

app.get('/reviews', (req, res) => {

  console.log(req.query);

  const queryParams = {
    page: req.query.page || 0,
    count: req.query.count || 5,
    sort: req.query.sort,
    product_id: req.query.product_id || 1
  }

  const query = `SELECT * FROM review WHERE product_id=${queryParams.product_id}`

  var resData = {
    product: queryParams.product_id,
    page: 0,
    count: queryParams.count,
    results: []
  }

  pool.query(query, (err, dbResponse) => {
    if (err) {
      res.status(400).send('Query to DB GET /reviews failed: ' + err);
    } else {
      resData.results = dbResponse.rows

      var photos = resData.results.map(review => {
        const query = `SELECT * FROM review_photos WHERE review_id=${review.id}`

        return new Promise((res, rej) => {
          pool.query(query, (err, photoRes) => {
            if (err) {console.log(err); rej(err)} else {
              review.photos = photoRes.rows
              res(resData);
            }
          });
        });
      });

      console.log(photos)
      Promise.all(photos)
        .then((data) => {
          res.status(200).send(data);
        })

    }
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
  });
});



app.put('/reviews/:review_id/helpful', (req, res) => {
  client.query('TODO;', (err, dbResponse) => {
    if (err) {
      res.status(400);
      res.send('Query to DB PUT /reviews/:review_id/helpful failed');
    }
    res.send(dbResponse);
    client.end();
  });
});

app.put('/reviews/:review_id/report', (req, res) => {
  client.query('TODO;', (err, dbResponse) => {
    if (err) {
      res.status(400);
      res.send('Query to DB PUT /reviews/:review_id/report failed');
    }
    res.send(dbResponse);
    client.end();
  });
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = app;