const {Router}  = require ('express');
const {validateJWT} = require('../middleware/validateJWT');

const{
    contentRate, 
    getInformativeContent, 
    publishContent, 
    getArticleByMedic} = require('../controllers/contentController');

const router = Router();

router.post('/create-rating/:contentId', [validateJWT], contentRate);
router.get('/obtain-informative-content', [validateJWT], getInformativeContent);
router.post('/publish-article', [validateJWT], publishContent);
router.get('/get-articles-by-medic', [validateJWT], getArticleByMedic);

module.exports = router;