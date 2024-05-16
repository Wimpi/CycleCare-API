const {Router}  = require ('express');

const {
    userLogin,
    registerNewUser,
} = require('../controllers/userController');

const router = Router();
router.post('/login', userLogin);
router.post('/registerUser', registerNewUser);
module.exports = router;