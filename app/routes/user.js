const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user'); 
const auth = require('../middleware/auth');

router.post('/signup', userCtrl.signup); // signup
router.post('/login',userCtrl.login); // login
router.delete('/delete', userCtrl.deleteUser); // delete a user
router.get('/:id',auth, userCtrl.readUserInfo); // get the user info
router.put('/:id', userCtrl.updateUserAccount); // update a user account
//router.post('/:id/report',userCtrl.reportUser);

module.exports = router;