const {Router}  = require ('express');

const {
    userLogin,
    registerNewUser,
    requestReset,
    verifyResetCode,
    resetPassword
} = require('../controllers/userController');


const router = Router();
router.post('/login', userLogin);
router.post('/registerUser', registerNewUser);
router.post('/request-reset', requestReset);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
module.exports = router;