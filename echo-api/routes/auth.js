const express = require("express");
const router = express.Router();

router.post("/register", (req, res) => {
    const { name, password, email } = req.body;

    if (!req.utils.checkEmail(email)) return res.status(406).send({ message: "Invalid email address. (Nice try...)" });

    // this is bad, prepare statements are better
    req.database.query("INSERT INTO users (name, email, password) VALUES ('" + name + "', '" + email + "', '" + password + "')", (err, result, fields) => {
        if (err) console.error(err);
        if (err) return res.status(406).send({ message: "Username or email already exists." });
        
        if (result && result.affectedRows > 0) {
            req.database.query("INSERT INTO user_status (userId, status) VALUES (" + result.insertId + ", '1')", (err, result, fields) => {
                if (err) console.error(err);
            });

            return res.status(200).json({ message: "Account created successfully!" });
        }

        res.status(406).json({ message: "Username already exists" });
    });
});

router.post("/login", (req, res) => {
    const { email, password } = req.body;
    
    if (!req.utils.checkEmail(email)) return res.status(406).send({ message: "Invalid email address. (Nice try...)" });

    req.database.query(`
        SELECT id, name, email, img, status FROM users
        INNSER JOIN user_status ON userId = id
        WHERE password = '${password}'
    `, (err, result, fields) => {
        if (err) console.error(err);
        if (err) return res.status(400).send({ message: "You messed up the request." });
        // send wrong credentials if no user was found
        if (!result) return res.status(401).send({ message: "Wrong credentials." });

        if (result && result.length > 0) {
            //remove any old tokens
            req.authenticator.revokeTokenFromUser(result[0].id);
            //generate a new token
            const token = req.authenticator.generateJWTToken(result[0].id);
            //update the user status to online
            req.database.query("UPDATE users SET online = ? WHERE id = ?", ["1", result[0].id], (err, result, fields) => {
                if (err) console.error(err);
            });
            //send the token to user
            return res.status(200).json({
                id: result[0].id,
                name: result[0].name,
                email: result[0].email,
                img: result[0].img,
                online: "1",
                status: result[0].status,
                token
            });
        }

        res.status(406).json({ message: "Username does not exist or password is incorrect." });
    });
});
    
router.get("/validate", (req, res) => {
    const token = req.headers.authorization;
    const result = req.authenticator.getUserId(token);
    if (result) {
        res.status(200).json({ id: result });
    } else {
        res.status(401).send({ message: "Unauthorized" });
    }
});

router.get("/verify", (req, res) => {
    const token = req.headers.authorization;
    const result = req.authenticator.getUserId(token);
    if (result) {
        //generate a new token
        const newToken = req.authenticator.generateJWTToken(result);
        //revoke the old token
        req.authenticator.revokeToken(token);
        //send the new token to user
        req.database.query(`
            SELECT id, name, email, img, status FROM users
            INNSER JOIN user_status ON userId = id
            WHERE id = ${result}
        `, (err, result, fields) => {
            if (err) console.error(err);
            if (err) return res.status(400).send({ message: "You messed up the request." });
            if (result && result.length > 0) {
                return res.status(200).json({
                    id: result[0].id,
                    name: result[0].name,
                    email: result[0].email,
                    img: result[0].img,
                    online: "1",
                    status: result[0].status,
                    token: newToken
                });
            }

            res.status(406).json({ message: "Username does not exist or password is incorrect." });
        });
    } else {
        res.status(401).send({ message: "Unauthorized" });
    }
});

module.exports = router;