const express = require('express');
const router = express.Router();
const {
    viewAll
} = require('../controller/categoryController');

router.use(express.json());

router.get('/', viewAll);

module.exports = router;