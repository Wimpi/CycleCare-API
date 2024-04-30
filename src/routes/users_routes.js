const {Router}  = require ('express');

const {
    userLogin,
} = require('../controllers/user_controller');

const router = Router();
router.post('/login', userLogin);

module.exports = router;