const conn = require('../mariadb')
const {StatusCodes} = require('http-status-codes');
const ensureAuthorization = require('../auth');
const jwt = require('jsonwebtoken');

const addToCart = (req, res) => {
    const {book_id, quantity} = req.body;
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
        let sql = `INSERT INTO cartItems (book_id, quantity, user_id) VALUES (?, ?, ?);`;
        let values = [book_id, quantity, auth.id];
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

const getCartItems = (req, res) => {
    const {selected} = req.body;
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
        let sql = `SELECT cartItems.id, book_id, title, summary, quantity, price
        FROM cartItems LEFT JOIN books ON cartItems.book_id = books.id
        WHERE user_id = ?`;
        let values = [auth.id];

        if (selected) {
            sql += ` AND cartItems.id IN (?);`;
            values.push(selected);
        }        
        
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

const removeCartItem = (req, res) => {
    const cartItemId = req.params.id;

    let sql = 'DELETE FROM cartItems WHERE id = ?;';
    conn.query(sql, cartItemId,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            return res.status(StatusCodes.OK).json(results);
    });
};

module.exports = {
    addToCart,
    getCartItems,
    removeCartItem
};