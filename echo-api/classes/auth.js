const cLoader = require("./configLoader");
const config = new cLoader().getCfg();

// class to make authentication to the api
class Auth {
    constructor() {
        this.tokens = [];
    }

    // generate a random string
    generateRandomString(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));
        return result;
    }

    // refresh token
    refreshToken(token) {
        for (var i = 0; i < this.tokens.length; i++) {
            if (this.tokens[i].refreshToken == token) {
                // generate a new token
                var newToken = this.generateRandomString(128);
                // ad expiring date to token
                var expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + config.tokenExpireInDays);
                // update the token
                this.tokens[i].token = newToken;
                this.tokens[i].expires = expireDate.getTime();
                return newToken;
            }
        }
        return false;
    }
    
    // generate a token for a user
    generateToken(user) {
        var token = this.generateRandomString(128);
        var refreshToken = this.generateRandomString(64);
        // ad expiring date to token
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + config.tokenExpireInDays);
        this.tokens.push({ token: token, user: user, expires: expireDate.getTime(), refreshToken: refreshToken });
        return { token: token, refreshToken: refreshToken };
    }

    // check if a token is valid and not expired
    checkToken(token) {
        for (var i = 0; i < this.tokens.length; i++) {
            if (this.tokens[i].token == token) {
                if (this.tokens[i].expires > new Date().getTime()) {
                    return this.tokens[i].user;
                } else {
                    // remove the token if it is expired
                    this.removeToken(token);
                    return false;
                }
            }
        }
        return false;
    }

    // remove a token
    removeToken(token) {
        for (var i = 0; i < this.tokens.length; i++) {
            if (this.tokens[i].token == token) {
                this.tokens.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    // refresh token
    refreshAuth(req, res) {
        const { token } = req.body;
        const newToken = this.refreshToken(token);
        if (newToken) {
            return res.status(200).json({ token: newToken });
        }
        res.status(401).json({ message: "Unauthorized" });
    }

    // check user credentials, and send token to user
    loginUser(req, res) {
        const { hash } = req.params;

        req.database.query("SELECT id, nick FROM users WHERE hash = '" + hash + "'", function (err, result, fields){
            if (err) return res.status(400).send({ error: "You messed up the request." });
            // send wrong credentials if no user was found
            if (!result) return res.status(401).send({ message: "Wrong credentials." });

            if (result && result.length > 0) {
                const { token, refreshToken } = this.generateToken(result[0].id);
                return res.status(200).json({
                    id: result[0].id,
                    nick: result[0].nick,
                    token,
                    refreshToken
                });
            }
            res.staus(500).json({ message: "Something went wrong." });
        });
    }
}

module.exports = Auth;