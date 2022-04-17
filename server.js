
const express = require("express"); // import express
const bodyParser = require("body-parser");
const cors = require("cors"); // import cors
const app = express();
module.exports = "dotenv";
require("./app/config/db.config");
const userRoutes = require("./app/routes/user");
const path = require('path');

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

var corsOptions = {
  origin: "http://localhost:4200"
};
app.use(cors(corsOptions));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const router = require('./app/routes/index');
// user routes
app.use('/api',router);

// add path on image
app.use('/images', express.static(path.join(__dirname, 'images')));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Response is OK." });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});



