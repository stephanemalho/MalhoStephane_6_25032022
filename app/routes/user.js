const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const auth = require("../middleware/auth");
const { body } = require("express-validator");
const validationResultExpress = require("../middleware/validationAuth");
const controlPassword = require("../middleware/control-password-user");

// create routes for users
router.post(
  "/signup",
  [
    body("email", "Format incorrect").trim().isEmail().normalizeEmail(),
  ], 
  validationResultExpress,
  controlPassword,
  userCtrl.signup
); // signup
router.post(
  "/login",
  [
    body("email", "Format incorrect").trim().isEmail().normalizeEmail(),
  ],
  validationResultExpress,
  controlPassword,
  userCtrl.login
); // login
router.delete("/", auth, userCtrl.deleteUser); // delete a user
router.get("/", auth, userCtrl.readUser); // get the user info
router.put("/", auth,[
  body("email", "Format incorrect").trim().isEmail().normalizeEmail(),
],
validationResultExpress,controlPassword, userCtrl.updateUser); // update a user account
router.post("/:id/report", auth, userCtrl.reportUser); // report the user
router.get("/export-data", auth, userCtrl.exportData); // export the user')

module.exports = router;
