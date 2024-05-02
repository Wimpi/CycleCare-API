const {Router}  = require ('express');

const {
    userLogin,
} = require('../controllers/userController');

const router = Router();
router.post('/login', userLogin);

module.exports = router;