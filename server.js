// require zone
const express = require("express"); // import express
const cors = require("cors"); // import cors
const app = express(); // create an express app for initialisations and middlewares 
const mongoSanitize = require("express-mongo-sanitize");
module.exports = "dotenv"; // export dotenv
require("./app/config/db.config"); // connect to config DB
const hateoasLinker = require("express-hateoas-links");
const path = require("path");
const helmet = require("helmet");
const colors = require("colors");
// add your next require on top of this comment :)

// hateoas links
app.use(hateoasLinker);
// parse requests in json format with:
app.use(express.json());
// header settings 
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // * means all origins are allowed to access the server
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  ); // allow headers
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  ); // allow methods
  next();
});
// allow cors
var corsOptions = {
  origin: "http://localhost:4200",
};
app.use(cors(corsOptions));
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// By default, $ and . characters are removed completely from user-supplied input in the following places:
// req.body
// req.params
// req.headers
// To remove data I use these defaults:
// allowDots and replaceWith
app.use(
  mongoSanitize({
    allowDots: true,
    replaceWith: "_",
  })
);
// user routes
const router = require("./app/routes/index");
app.use("/api", router);
// add path on image
app.use("/images", express.static(path.join(__dirname, "images")));
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Response is OK." });
});
// listen on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(colors.blue(`Server is running on port ${PORT}. 🔥🔥🔥 http://localhost:3000`));
});
// if error, send 404 status
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!") 
}) 
// custom error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.use(helmet()); // add helmet to protect app from some common attacks (https://expressjs.com/en/advanced/best-practice-security.html)


