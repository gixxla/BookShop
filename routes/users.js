const express = require('express');
const router = express.Router();

router.use(express.json());

router.post('/join', (req, res) => {
    res.json('회원가입');
});

router.post('/login', (req, res) => {
    res.json('로그인');
});

router.post('/pwreset', (req, res) => {
    res.json('비밀번호 초기화 요청');
});

router.put('/pwreset', (req, res) => {
    res.json('비밀번호 초기화');
});

module.exports = router;