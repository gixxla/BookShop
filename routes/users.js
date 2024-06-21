const express = require('express');
const router = express.Router();
const {
    join, 
    login, 
    passwordResetRequest, 
    passwordReset
} = require('../controller/userController');

router.use(express.json());

router.post('/join', join);
router.post('/login', login);
router.post('/pwreset', passwordResetRequest);
router.put('/pwreset', passwordReset);

module.exports = router;