const express = require('express');
const router = express.Router();

router.use(express.json());

router.post('/', (req, res) => {
    res.json('장바구니 담기');
});

router.get('/', (req, res) => {
    res.json('장바구니 조회');
});

router.delete('/:id', (req, res) => {
    res.json('장바구니 도서 삭제');
});

// router.get('/', (req, res) => {
//     res.json('장바구니 조회');
// });

module.exports = router;