const conn = require('../mariadb')
const {StatusCodes} = require('http-status-codes');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

const join = (req, res) => {
    const {email, password} = req.body;

    const salt = crypto.randomBytes(16).toString('base64');
    const hashedPW = crypto.pbkdf2Sync(password, salt, 10000, 16, 'sha512').toString('base64');

    let sql = `INSERT INTO users (email, password, salt) VALUES (?, ?, ?);`;
    let values = [email, hashedPW, salt];

    conn.query(sql, values,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            return res.status(StatusCodes.CREATED).json(results);
        }
    );
};

const login = (req, res) => {
    const {email, password} = req.body;

    let sql = `SELECT * FROM users WHERE email = ?;`;
    conn.query(sql, email,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            const user = results[0];

            const hashedPW = crypto.pbkdf2Sync(password, user.salt, 10000, 16, 'sha512').toString('base64');

            if (user && user.password == hashedPW) {
                const token = jwt.sign({
                    id : user.id,
                    email : user.email
                }, process.env.PRIVATE_KEY, {
                    expiresIn : '1m',
                    issuer : "ewon"
                })

                res.cookie("token", token, {
                    httpOnly : true
                });
                console.log(token);

                return res.status(StatusCodes.OK).json(results);
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).end();
            }     
    });
};

const passwordResetRequest = (req, res) => {
    const {email} = req.body;

    let sql = `SELECT * FROM users WHERE email = ?;`;
    conn.query(sql, email,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            const user = results[0];
            if (user) {
                return res.status(StatusCodes.OK).json({
                    email : email
                });
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).end();
            }
    });
};

const passwordReset = (req, res) => {
    const {email, password} = req.body;

    const salt = crypto.randomBytes(16).toString('base64');
    const hashedPW = crypto.pbkdf2Sync(password, salt, 10000, 16, 'sha512').toString('base64');

    let sql = `UPDATE users SET password = ?, salt = ? WHERE email = ?;`;
    let values = [hashedPW, salt, email];
    conn.query(sql, values,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            if (results.affectedRows == 0) {
                return res.status(StatusCodes.BAD_REQUEST).end();
            } else {
                return res.status(StatusCodes.OK).json(results).end();
            }
        }
    )
};

module.exports = {
    join,
    login,
    passwordResetRequest,
    passwordReset
};