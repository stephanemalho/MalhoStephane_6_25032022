const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user'); 
const auth = require('../middleware/auth');

router.post('/signup', userCtrl.signup); // signup
router.post('/login',userCtrl.login); // login
router.delete('/',auth, userCtrl.deleteUser); // delete a user
router.get('/',auth, userCtrl.readUserInfo); // get the user info
router.put('/',auth, userCtrl.updateUserAccount); // update a user account
//router.post('/:id/report',auth,userCtrl.reportUser);

module.exports = router;