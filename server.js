
const express = require("express"); // import express
const bodyParser = require("body-parser");
const cors = require("cors"); // import cors
const app = express();
MOD_EXP = "dotenv";
require("./app/config/db.config");

var corsOptions = {
  origin: "http://localhost:8081"
};
app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// set port, listen for requests

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Response is OK." });
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});



