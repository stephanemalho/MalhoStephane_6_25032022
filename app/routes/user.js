const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const auth = require("../middleware/auth");
const { body } = require("express-validator");
const validationResultExpress = require("../middleware/validationAuth");

// create routes for users
router.post(
  "/signup",
  [
    body("email", "Format incorrect").trim().isEmail().normalizeEmail(),
    body("password", "Format incorrect").trim().isLength({ min: 6 , max: 64}),
  ], // trim must be before isEmail
  validationResultExpress,
  userCtrl.signup
); // signup
router.post(
  "/login",
  [
    body("email", "Format incorrect").trim().isEmail().normalizeEmail(),
    body("password", "Format incorrect").trim().isLength({ min: 6 , max: 64}),
  ],
  validationResultExpress,
  userCtrl.login
); // login
router.delete("/", auth, userCtrl.deleteUser); // delete a user
router.get("/", auth, userCtrl.readUser); // get the user info
router.put("/", auth, userCtrl.updateUser); // update a user account
router.post("/:id/report", auth, userCtrl.reportUser); // report the user
router.get("/export-data", auth, userCtrl.exportData); // export the user')

module.exports = router;
