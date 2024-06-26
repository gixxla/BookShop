const express = require('express');
const router = express.Router();
const {
    getAll,
    getDetail
} = require('../controller/bookController');

router.use(express.json());

router.get('/', getAll);
router.get('/:id', getDetail);

module.exports = router;