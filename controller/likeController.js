const conn = require('../mariadb')
const {StatusCodes} = require('http-status-codes');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const addLike = (req, res) => {
    const book_id = req.params.id;
    const auth = ensureAuthorization(req);

    if (auth instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message : "로그인 세션이 만료되었습니다. 다시 로그인하세요."
        });
    } else if (auth instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message : "올바르지 않은 토큰입니다."
        });
    } else {
        let sql = 'INSERT INTO likes (user_id, liked_book_id) VALUES (?, ?)';
        let values = [auth.id, book_id];
        conn.query(sql, values,
            (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(StatusCodes.BAD_REQUEST).end();
                }
    
                return res.status(StatusCodes.OK).json(results);
        });
    }    
};

const removeLike = (req, res) => {
    const book_id = req.params.id;
    const auth = ensureAuthorization(req);

    if (auth instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message : "로그인 세션이 만료되었습니다. 다시 로그인하세요."
        });
    } else if (auth instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message : "올바르지 않은 토큰입니다."
        });
    } else {
        let sql = 'DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?';
        let values = [auth.id, book_id];
        conn.query(sql, values,
            (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(StatusCodes.BAD_REQUEST).end();
                }
    
                return res.status(StatusCodes.OK).json(results);
        });
    }    
};

function ensureAuthorization(req) {
    try {
        let auth = req.headers['authorization'];
        console.log("received jwt : ", auth);

        let decodedUserData = jwt.verify(auth, process.env.PRIVATE_KEY)
        console.log(decodedUserData);

        return decodedUserData;
    } catch (err) {
        console.log(err.name);
        console.log(err.message);

        return err;
    }
}

module.exports = {
    addLike,
    removeLike
}