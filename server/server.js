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

// TODO: This query returns two of the same data, and does not sort correctly
app.get('/reviews', (req, res) => {

  console.log(req.query);

  const queryParams = {
    page: req.query.page || 0,
    count: req.query.count || 5,
    sort: req.query.sort || "helpful",
    product_id: req.query.product_id || 1
  }

  let sortQuery = "ORDER BY helpfulness DESC"

  if (queryParams.sort === "newest") {
    sortQuery = "ORDER BY date DESC"
  } else {
    sortQuery = "ORDER BY rating DESC"
  }

  const query = `SELECT * FROM review WHERE product_id=${queryParams.product_id} ` + sortQuery;

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
      resData.results = dbResponse.rows;

      var photos = resData.results.map(review => {
        const query = `SELECT * FROM review_photos WHERE review_id=${review.id}`

        return new Promise((res, rej) => {
          pool.query(query, (err, photoRes) => {
            if (err) {console.log(err); rej(err)} else {
              review.photos = photoRes.rows;
              res(resData);
            }
          });
        });
      });

      Promise.all(photos)
        .then((data) => {
          res.status(200).send(data[0]);
        });

    }
  });
});

app.get('/reviews/meta', (req, res) => {

  var queryParams = {
    product_id: req.query.product_id
  }

  var query = `SELECT (rating, reccomended) FROM review WHERE product_id=${queryParams.product_id}`

  var resData = {
    product_id: req.query.product_id || 0,
    rating: {},
    reccommended: {"0": 0, "1": 0},
    characteristics: {}
  }

  pool.query(query, (err, dbResponse) => {
    if (err) {
      res.status(400);
      res.send('Query to DB GET /reviews/meta failed');
    }

    // TODO, this is hardcoded to anticipate a 1 character response in rating which may not be the case
    let characteristics = dbResponse.rows.map(meta => {

      if (resData.rating[meta.row[1]]) {
        resData.rating[meta.row[1]] += 1;
      } else {
        resData.rating[meta.row[1]] = 1;
      }

      if (resData.rating[meta.row[4]] === "t") {
        resData.reccommended["0"] += 1;
      } else {
        resData.reccommended["1"] += 1;
      }

      const query = `SELECT characteristic.id,value,name 
                    FROM characteristic_review 
                    INNER JOIN characteristic 
                    ON (characteristic_review.id = characteristic.id) 
                    WHERE characteristic_review.review_id=${queryParams.product_id};`

      return new Promise((res, rej) => {
        pool.query(query, (err, charRes) => {
          if (err) {console.log(err); rej(err)} else {
            console.log(charRes);

            charRes.rows.map (row => {
              resData.characteristics[row.name] = {
                id: row.id,
                value: row.value
              };
            })

            res(resData);
          }
        });
      });

    });

    Promise.all(characteristics)
      .then((data) => {
        res.status(200).send(data[0])
      });

  });
});

app.post('/reviews', (req, res) => {

  console.log(req.query)

  // Query Parameters
  var qp = {
    product_id: req.query.product_id,
    rating: req.query.rating,
    summary: req.query.body,
    reccommended: req.query.reccommended || false,
    name: req.query.name,
    email: req.query.email,
    photos: req.query.photos,
    characteristics: req.query.characteristics
  }

  if (typeof qp.characteristics !== 'object') {
    try {
      qp.characteristics = JSON.parse(qp.characteristics);
      console.log("String to Object:", qp.characteristics);
    } catch (error) {
      res.status(400).send("Failed to convert characetristics to object: " + error);
    }
  }
  

  let query = `INSERT INTO review(product_id, rating, date, summary, reccomended, reported, reviewername, revieweremail) 
              VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`

  pool.query(query, [qp.product_id, qp.rating, Date.now(), qp.summary, qp.reccommended, false, qp.name, qp.email])
    .then((resp) => {

      
      var promises = qp.photos.map((photo) => {
        var query = 'INSERT INTO review_photos(review_id, url) VALUES($1, $2)';

        return pool.query(query, [resp.rows[0].id, photo]);
      });

      
      for (key in qp.characteristics) {

        var characteristicsQuery = 'INSERT INTO characteristic_review(characteristic_id, review_id, value) VALUES($1, $2, $3)';

        console.log("Key: ", key);
        console.log("ReviewID: ", resp.rows[0].id);
        console.log("Value:", qp.characteristics[key]);
        let prom = pool.query(characteristicsQuery, [key, resp.rows[0].id, qp.characteristics[key]])
        promises.push(prom);
      }

      Promise.all(promises)
        .then((data) => {
          res.status(200).send(data);
        });

    })
    .catch((err) => {
      res.status(400).send("Error: " + err);
    });
});

app.put('/reviews/:review_id/helpful', (req, res) => {

  var qp = {
    review_id: req.params.review_id
  }

  let query = 'UPDATE review SET reccomended=true WHERE id=' + qp.review_id;

  pool.query(query)
    .then((data) => {
      res.status(204).send("Success: " + data);
    })
    .catch((err) => {
      res.status(400).send("Error: " + err);
    });
});

app.put('/reviews/:review_id/report', (req, res) => {

  var qp = {
    review_id: req.params.review_id
  }

  let query = 'UPDATE review SET reported=true WHERE id=' + qp.review_id;

  pool.query(query)
    .then((data) => {
      res.status(204).send("Success: " + data);
    })
    .catch((err) => {
      res.status(400).send("Error: " + err);
    });
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = app;