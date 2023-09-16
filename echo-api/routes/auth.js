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
            return res.status(200).json({ message: "Account created successfully!" });
        }

        res.status(406).json({ message: "Username already exists" });
    });
});

router.post("/login", (req, res) => {
    const { email, password } = req.body;
    
    if (!req.utils.checkEmail(email)) return res.status(406).send({ message: "Invalid email address. (Nice try...)" });

    req.database.query("SELECT id, name, email, img, online FROM users WHERE password = '" + password + "'", (err, result, fields) => {
        if (err) console.error(err);
        if (err) return res.status(400).send({ message: "You messed up the request." });
        // send wrong credentials if no user was found
        if (!result) return res.status(401).send({ message: "Wrong credentials." });

        if (result && result.length > 0) {
            const { token, refreshToken } = req.authenticator.generateToken(result[0].id);
            return res.status(200).json({
                id: result[0].id,
                name: result[0].name,
                email: result[0].email,
                img: result[0].img,
                online: result[0].online,
                token,
                refreshToken
            });
        }

        res.status(406).json({ message: "Username does not exist or password is incorrect." });
    });
});

module.exports = router;