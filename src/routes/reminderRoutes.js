const {Router}  = require ('express');
const {validateJWT} = require('../middleware/validateJWT')
const{registerReminder, reminderUpdate} = require('../controllers/reminderController');

const router = Router();

router.post('/create-reminder', [validateJWT], registerReminder);
router.post('/update-reminder/:reminderId', [validateJWT], reminderUpdate);

module.exports = router;