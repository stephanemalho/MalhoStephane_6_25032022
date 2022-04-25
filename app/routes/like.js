const express = require('express');
const router = express.Router(); 
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');

router.post("/:id/like", auth, sauceCtrl.likeSauce);  // like a sauce

module.exports = router;