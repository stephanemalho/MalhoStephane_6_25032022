const dbConfig = require("../config/db.config.js");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const db = {};
db.mongoose = mongoose;
db.url = 'mongodb+srv://P6openclassrooms:P6openclassrooms@cluster0.pfz4v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
db.tutorials = require("./tutorial.model.js")(mongoose);
module.exports = db;