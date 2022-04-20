const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');


router.get("/:id", sauceCtrl.readSauce);
router.get("/", sauceCtrl.getAllSauces);
router.get("/:userId", sauceCtrl.getAllSaucesByUserId);
router.post("/", auth, multer, sauceCtrl.createSauce);
router.post("/:id/like", auth, sauceCtrl.addLike);
router.post("/:id/dislike", auth, sauceCtrl.addDislike);



module.exports = router;