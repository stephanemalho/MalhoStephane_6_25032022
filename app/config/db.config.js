const mongoose = require("mongoose");
const bunyan = require("bunyan");
const colors = require("colors")
require("dotenv").config();

function MyRawStream() { // create a custom stream 
MyRawStream.prototype.write = function(rec) {
  console.log('[%s] %s: %s', 
  rec.time.toISOString(),
  bunyan.nameFromLevel[rec.level], 
  rec.msg); // log the record
}
}

const log = bunyan.createLogger({ // create a logger with the following options : 
  name: "MongoDB Driver", // 
  serializers: {
    dbQuery: serializer, // serialize the query to be logged 
  },
  streams: [
    {
      stream: process.stdout, 
      level: "info", // log info and above to stdout 
    },
    {
      stream: process.stdout,
      level: "debug", // log debug and above to stdout
    },
    {
      stream: process.stderr,
      level: "error", // log error and above to stderr
    },
    {
      stream: new MyRawStream(),
      type: "raw",
    },
    {
      type: "rotating-file",
      path: "./logs/mongodb.log",
      period: "1d", // daily rotation
      count: 3, // keep 3 back copies
    },
  ],
});

if (!process.env.MONGO_URI) { // if MONGO_URI is not defined in .env file
  log.error(colors.red("No DB_URL found in .env configuration")); //console.log("No DB_URL found in .env configuration"); // log an error message 
}

function serializer(data) {
  let query = JSON.stringify(data.query);
  let options = JSON.stringify(data.options || {});

  return `db.${data.coll}.${data.method}(${query}, ${options});`; 
}

mongoose.set("debug", function (coll, method, query, doc, options) { 
  let set = {
    coll: coll,
    method: method,
    query: query,
    doc: doc,
    options: options,
  };

  log.info(colors.yellow({
    dbQuery: set,
  }));
});

mongoose // connect to mongoDB and send message to console on success or failure
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl:true, // use ssl to connect to mongoDB 
  })
  .then(() => {
    console.log(colors.cyan("connected to database 📡")); // log a success message colored in green
  })
  .catch((error) => {
    console.log(colors.red("Database connection error: ❌ " + error)); // log a colored error message
  });

  module.exports = mongoose.connection;
  module.exports = log;