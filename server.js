
const express = require("express"); // import express
const bodyParser = require("body-parser");
const cors = require("cors"); // import cors
const app = express();
const mongoose = require("mongoose");

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
const db = require("./app/models");

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Response OK." });
});

//connect to databas mongoDB
mongoose.connect('mongodb+srv://P6openclassrooms:P6openclassrooms@cluster0.pfz4v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

