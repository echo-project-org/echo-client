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
    
    // generate a token for a user
    generateToken(user) {
        var token = this.generateRandomString(32);
        this.tokens.push({ token: token, user: user });
        return token;
    }

    // check if a token is valid
    checkToken(token) {
        for (var i = 0; i < this.tokens.length; i++) {
            if (this.tokens[i].token == token) return this.tokens[i].user;
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

    // check if a user is logged in
    checkLogin(req, res, next) {
        var token = req.headers['x-access-token'];
        if (token) {
            var user = this.checkToken(token);
            if (user) {
                req.user = user;
                next();
                return;
            }
        }
        res.status(401).send({ error: "You are not logged in." });
    }

    // check credentials for login and return a token
    checkCredentials(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        if (username == "admin" && password == "admin") {
            var token = this.generateToken(username);
            res.status(200).send({ token: token });
        } else {
            res.status(401).send({ error: "Wrong credentials." });
        }
    }
}