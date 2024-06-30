const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const ensureAuthorization = (req) => {
    try {
        let auth = req.headers['authorization'];
        console.log("received jwt : ", auth);

        if (auth) {
            let decodedUserData = jwt.verify(auth, process.env.PRIVATE_KEY)
            console.log(decodedUserData);
            return decodedUserData;
        } else {
            throw new ReferenceError("jwt must be provided");
        }        
    } catch (err) {
        console.log(err.name);
        console.log(err.message);

        return err;
    }
};

module.exports = ensureAuthorization;