const express = require('express');
const router = express.Router();
const {
    order,
    getOrders,
    getOrderDetail
} = require('../controller/orderController');

router.use(express.json());

router.post('/', order);

router.get('/', getOrders);

router.get('/:id', getOrderDetail);

module.exports = router;