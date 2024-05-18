const { Router } = require('express');
const router = Router();

const {
    userLogin,
    registerNewUser,
    requestReset,
    verifyResetCode,
    resetPassword
} = require('../controllers/userController');

router.post('/login', userLogin);
router.post('/registerUser', registerNewUser);
router.post('/request-reset/:email', requestReset);
router.post('/verify-reset-code/:email', verifyResetCode);
router.post('/reset-password/:email', verifyResetCode, resetPassword);

module.exports = router;