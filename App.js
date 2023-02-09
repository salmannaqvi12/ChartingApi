const express = require("express");
const multer = require("multer");
const csv = require("fast-csv");
const fs = require("fs");
const app = express();
const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const connectDb = async () => {
  try {
    const client = new Client({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    });
    client.connect(function (err) {
      if (err) {
        return console.error("error: " + err.message);
      }
      console.log("Connected to the PgSQL server.");
    });
    console.log(res);
    await client.end();
  } catch (error) {
    console.log(error);
  }
};
connectDb();

// Set up multer to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Route for file upload
app.post("/upload", upload.single("upload"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file was uploaded.");
  }

  // Convert the contents of the file from .txt to .csv
  const stream = fs.createReadStream(req.file.path);
  const csvStream = csv.parse({ delimiter: "," });

  stream.pipe(csvStream).on("data", (row) => {
    // Store the data in the PostgreSQL database
    client.query("INSERT INTO test_table(col1, col2) VALUES($1, $2)", [
      row[0],
      row[1],
    ]);
  });

  res.send(
    "File uploaded, converted to .csv, and data stored in the database!"
  );
});
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}!`));
