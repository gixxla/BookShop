const express = require('express');
const router = express.Router();
const {
    viewAll,
    viewDetail
} = require('../controller/bookController');

router.use(express.json());

router.get('/', viewAll);
router.get('/:id', viewDetail);

module.exports = router;