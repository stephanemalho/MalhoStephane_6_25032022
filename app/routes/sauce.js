const express = require('express');
const router = express.Router(); 
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config'); // multer configuration


router.get("/:id",auth, sauceCtrl.readSauce); // get the sauce
router.get("/",auth, sauceCtrl.readAllSauces); // get all the sauces
router.post("/", auth, multer, sauceCtrl.createSauce); // create a sauce
router.put("/:id", auth, multer, sauceCtrl.updateSauce); // update a sauce 
router.delete("/:id", auth, sauceCtrl.deleteSauce); // delete a sauce


module.exports = router;