const {Router}  = require ('express');
const {validateJWT} = require('../middleware/validateJWT');

const{
    contentRate, 
    getInformativeContent, 
    publishContent} = require('../controllers/contentController');

const router = Router();

router.post('/create-rating/:contentId', [validateJWT], contentRate);
router.get('/obtain-informative-content', [validateJWT], getInformativeContent);
router.post('/publish-article', [validateJWT], publishContent);

module.exports = router;