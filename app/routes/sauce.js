const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');


router.get("/sauces/:id", sauceCtrl.readSauce);
router.post("/sauces", auth, multer, sauceCtrl.createSauce);
//router.post("/", sauceCtrl.createSauce);


module.exports = router;