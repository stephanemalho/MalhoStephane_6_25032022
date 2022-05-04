const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user'); 


router.post('/signup', userCtrl.signup); // signup
router.post('/login', userCtrl.login); // login
router.delete('/delete', userCtrl.deleteUser); // delete a user

module.exports = router;