
const express = require("express"); // import express
const cors = require("cors"); // import cors
const app = express();
module.exports = "dotenv"; // export dotenv
require("./app/config/db.config");
const hateoasLinker = require("express-hateoas-links");
const path = require('path');



// add hateoas links
app.use(hateoasLinker); 

// parse requests of content-type - application/json
app.use(express.json()); 

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');  // * means all origins
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // allow headers 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // allow methods   
  next();
}); 

// allow cors 
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

// listen on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
}); 

