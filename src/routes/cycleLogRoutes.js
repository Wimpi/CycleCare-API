const {Router}  = require ('express');
const {validateJWT} = require('../middleware/validateJWT')
const router = Router();

router.post('/register-cycle-log', [validateJWT])
module.exports = router;