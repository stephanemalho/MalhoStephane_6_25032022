const express = require('express');
const router = express.Router(); 
const likeSauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');

router.post("/:id/like",auth, likeSauceCtrl.likeSauce);  // like a sauce

module.exports = router;