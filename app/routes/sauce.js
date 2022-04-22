const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const like = require('../controllers/like');

router.get("/:id",auth, sauceCtrl.readSauce);
router.get("/",auth, sauceCtrl.readAllSauces);
router.post("/", auth, multer, sauceCtrl.createSauce);
router.put("/:id", auth, multer, sauceCtrl.updateSauce);
router.post("/:id/like", auth, like.likeSauce);

module.exports = router;