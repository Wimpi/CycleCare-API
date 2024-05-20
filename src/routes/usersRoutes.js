const { Router } = require('express');
const router = Router();
const verifyResetCode = require('../middleware/validateResetCode');
const {
    userLogin,
    registerNewUser,
    requestReset,
    resetPassword
} = require('../controllers/userController');

router.post('/login', userLogin);
router.post('/registerUser', registerNewUser);
router.post('/request-reset/:email', requestReset);
router.post('/reset-password/:email', verifyResetCode, resetPassword);

module.exports = router;