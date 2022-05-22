const express = require("express");
const router = express.Router();
const userRoutes = require("./user");
const sauceRoutes = require("./sauce");
const likeRoutes = require("./like");


// add to params
router.use("/auth", userRoutes); // auth routes
router.use("/sauces", sauceRoutes); // sauce routes
router.use("/sauces", likeRoutes); // like routes

module.exports= router;