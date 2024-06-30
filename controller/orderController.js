const mariadb = require('mysql2/promise');
const {StatusCodes} = require('http-status-codes');
const ensureAuthorization = require('../auth');
const jwt = require('jsonwebtoken');

const order = async (req, res) => {
    const conn = await mariadb.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'Bookshop',
        dateStrings: true
    });

    const {items, delivery, totalQuantity, totalPrice, firstBookTitle} = req.body;
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
        let sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?);`;
        let values = [delivery.address, delivery.receiver, delivery.contact];
        let [results] = await conn.execute(sql, values);
        let deliveryId = results.insertId;

        sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id)
                VALUES (?, ?, ?, ?, ?);`;
        values = [firstBookTitle, totalQuantity, totalPrice, auth.id, deliveryId];
        [results] = await conn.execute(sql, values);
        let orderId = results.insertId;

        sql = `SELECT book_id, quantity FROM cartItems WHERE id IN (?);`;
        let [orderItems, fields] = await conn.query(sql, [items]);

        sql = `INSERT INTO orderedBook (order_id, book_id, quantity)
                VALUES ?;`;  
        values = [];
        orderItems.forEach((item) => {
            values.push([orderId, item.book_id, item.quantity]);
        }) 
        results = await conn.query(sql, [values]);

        let result = await deleteCartItems(conn, items);
        
        return res.status(StatusCodes.OK).json(result);
    }    
};

const deleteCartItems = async (conn, items) => {
    let sql = `DELETE FROM cartItems WHERE id IN (?);`;
    let result = await conn.query(sql, [items]);

    return result;
}

const getOrders = async (req, res) => {
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
        const conn = await mariadb.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'Bookshop',
            dateStrings: true
        });
    
        let sql = `SELECT orders.id, created_at, address, receiver, contact, book_title, total_quantity, total_price
        FROM orders LEFT JOIN delivery
        ON orders.delivery_id = delivery.id
        WHERE user_id = ?;`;
        let [rows, fields] = await conn.query(sql, auth.id);

        rows.map(row => {
            row.createdAt = row.created_at;
            row.bookTitle = row.book_title;
            row.totalQuantity = row.total_quantity;
            row.totalPrice = row.total_price;

            delete row.created_at;
            delete row.book_title;
            delete row.total_quantity;
            delete row.total_price;
        })
    
        return res.status(StatusCodes.OK).json(rows);
    }
};

const getOrderDetail = async (req, res) => {
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
        const conn = await mariadb.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'Bookshop',
            dateStrings: true
        });
        
        const orderId = req.params.id;
    
        let sql = `SELECT book_id, title, author, price, quantity
        FROM orderedBook LEFT JOIN books
        ON orderedBook.book_id = books.id
        WHERE order_id = ?;`;
        let [rows, fields] = await conn.query(sql, [orderId]);

        rows.map(row => {
            row.bookId = row.book_id;
            delete row.book_id;
        })
    
        return res.status(StatusCodes.OK).json(rows);
    }
};

module.exports = {
    order,
    getOrders,
    getOrderDetail
};