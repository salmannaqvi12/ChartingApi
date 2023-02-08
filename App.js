const express = require('express');
const multer = require('multer');
const csv = require('fast-csv');
const fs = require('fs');
const { Client } = require('pg');
const app = express();

// Connect to the PostgreSQL database
const client = new Client({
    user: "oqwctdvxynctzx",
    host: "ec2-3-217-251-77.compute-1.amazonaws.com",
    database: "dfjosqa879ht6f",
    password: "edf26343c914f3174f3c5cfa3578cf53ba7b1b4756381b95d6099c90c8debf9f",
    port: 5432,
});
client.connect();

// Create the table in the database to store the data
client.query(`
  CREATE TABLE IF NOT EXISTS test_table (
    id SERIAL PRIMARY KEY,
    col1 TEXT,
    col2 TEXT
  );
`, (err, res) => {
  if (err) throw err;
});

// Set up multer to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Route for file upload
app.post('/upload', upload.single('sampleFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file was uploaded.');
  }

  // Convert the contents of the file from .txt to .csv
  const stream = fs.createReadStream(req.file.path);
  const csvStream = csv.parse({ delimiter: ',' });

  stream.pipe(csvStream)
    .on('data', row => {
      // Store the data in the PostgreSQL database
      client.query('INSERT INTO test_table(col1, col2) VALUES($1, $2)', [row[0], row[1]]);
    });

  res.send('File uploaded, converted to .csv, and data stored in the database!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}!`));