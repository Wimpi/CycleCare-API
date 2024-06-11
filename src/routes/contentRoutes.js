const {Router}  = require ('express');
const {validateJWT} = require('../middleware/validateJWT');

const{
    contentRate, 
    getInformativeContent, 
    publishContent, 
    getArticleByMedic, 
    getArticleById, 
    updateInformativeContent, 
    getAverageByContentId} = require('../controllers/contentController');

const router = Router();

router.post('/create-rating/:contentId', [validateJWT], contentRate);
router.get('/obtain-informative-content', [validateJWT], getInformativeContent);
router.post('/publish-article', [validateJWT], publishContent);
router.get('/get-articles-by-medic', [validateJWT], getArticleByMedic);
router.get('/get-article-by-id/:contentId', [validateJWT], getArticleById);
router.post('/update-informative-content', [validateJWT], updateInformativeContent);
router.get('/get-average-by-content/:contentId', [validateJWT], getAverageByContentId)

module.exports = router;