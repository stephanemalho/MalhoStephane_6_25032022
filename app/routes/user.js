const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user'); 
const auth = require('../middleware/auth');


// create routes for users
router.post('/signup', userCtrl.signup); // signup
router.post('/login',userCtrl.login); // login
router.delete('/',auth, userCtrl.deleteUser); // delete a user
router.get('/',auth, userCtrl.readUser); // get the user info
router.put('/',auth, userCtrl.updateUser); // update a user account
router.post('/:id/report',auth,userCtrl.reportUser); // report the user
router.get('/export-data',auth,userCtrl.exportData); // export the user')


module.exports = router;