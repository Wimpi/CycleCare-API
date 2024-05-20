const {Router}  = require ('express');
const {validateJWT} = require('../middleware/validateJWT')
const{
    registerReminder, 
    reminderUpdate, 
    getCurrentUserReminders,
    removeReminder} = require('../controllers/reminderController');

const router = Router();

router.post('/create-reminder', [validateJWT], registerReminder);
router.post('/update-reminder/:reminderId', [validateJWT], reminderUpdate);
router.get('/user-reminders/', validateJWT, getCurrentUserReminders);
router.delete('/reminder/:reminderId', validateJWT, removeReminder);

module.exports = router;