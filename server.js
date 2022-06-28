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
const rateLimit = require('express-rate-limit')
const slowDown = require("express-slow-down");
// add your next require on top of this comment :)

// hateoas links
app.use(hateoasLinker);

// parse requests in json format with:
app.use(express.json());

// To Reduce Fingerprinting disable x-powered-by header
app.disable('x-powered-by'); 

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
app.use(
  mongoSanitize({
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

// add helmet to protect app from some common attacks (https://expressjs.com/en/advanced/best-practice-security.html)
app.use(helmet()); 

// Basic rate-limiting middleware for Express
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to API calls only
app.use('/api', apiLimiter)

// Basic rate-limiting middleware for Express that slows down responses rather than blocking them outright
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // allow 100 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 100:
  // request # 101 is delayed by  500ms
  // request # 102 is delayed by 1000ms
  // request # 103 is delayed by 1500ms
  // etc.
});

//  apply to all requests
app.use(speedLimiter);
