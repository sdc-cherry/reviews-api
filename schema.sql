
CREATE TABLE IF NOT EXISTS Product(
  ID SERIAL PRIMARY KEY,
  name VARCHAR(250) NOT NULL,
  slogan TEXT,
  description TEXT,
  category TEXT,
  defaultPrice DECIMAL
);

CREATE TABLE IF NOT EXISTS Review(
  ID SERIAL PRIMARY KEY,
  product_id INT,
  CONSTRAINT product_id
    FOREIGN KEY(product_id)
      REFERENCES Product(ID),
  rating INT,
  date BIGINT,
  summary TEXT,
  body TEXT,
  reccomended BOOLEAN,
  reported BOOLEAN,
  reviewername VARCHAR(50),
  revieweremail VARCHAR(250),
  response TEXT,
  helpfulness INT
);

CREATE TABLE IF NOT EXISTS characteristic(
  ID SERIAL PRIMARY KEY,
  product_id INT,
  CONSTRAINT product_id
    FOREIGN KEY(product_id)
      REFERENCES Product(ID),
  name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS characteristic_review(
  ID SERIAL PRIMARY KEY,
  characteristic_id INT,
  review_id INT,
  CONSTRAINT characteristic_id
    FOREIGN KEY(characteristic_id)
      REFERENCES characteristic(ID),
  CONSTRAINT review_id
    FOREIGN KEY(review_id)
      REFERENCES review(ID),
  value INT
);

CREATE TABLE IF NOT EXISTS review_photos(
  ID SERIAL PRIMARY KEY,
  review_id INT,
  CONSTRAINT review_id
    FOREIGN KEY (review_id)
      REFERENCES review(ID),
  url TEXT
);


-- Copies in short data
\copy product from 'tmp/SDCData/short/productshort.csv' WITH CSV HEADER
\copy review from 'tmp/SDCData/short/reviewsshort.csv' WITH CSV HEADER
\copy characteristic from 'tmp/SDCData/short/characteristicsshort.csv' WITH CSV HEADER
\copy characteristic_review from 'tmp/SDCData/short/characteristic_reviewsshort.csv' WITH CSV HEADER
\copy review_photos from 'tmp/SDCData/short/review_photosshort.csv' WITH CSV HEADER
