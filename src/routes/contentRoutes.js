const {Router}  = require ('express');
const {validateJWT} = require('../middleware/validateJWT');

const{
    contentRate, 
    getInformativeContent} = require('../controllers/contentController');

const router = Router();

router.post('/create-rating/:contentId', [validateJWT], contentRate);
router.get('/obtain-informative-content', [validateJWT], getInformativeContent);

module.exports = router;