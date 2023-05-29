var mysql = require('mysql'); 
const express = require('express');
const server = express();
const bodyParser = require('body-parser');

const cLoader = require("./classes/configLoader");
const config = new cLoader().getCfg();

const OAuth = require("./classes/auth");
const authenticator = new OAuth();

require("./classes/logger");

const con = mysql.createConnection(config.database);
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to database!");
});

// add body parser middleware for api requests
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.use((req, res, next) => {
    console.log('Got api request:', Date.now(), "Query:", req.url);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, HTTP_X_REQUESTED_WITH");
    req.database = con;
    // check if headers have a token and if it's valid
    if (req.headers['Authentication']) {
        if (authenticator.checkToken(req.headers['Authentication'])) {
            return next();
        }
    } else {
        // check if url contains auth
        if (req.url.includes("/auth")) {
            console.log(req.body)
            // check if in body there is a type "register" or "login"
            if (req.body.type === "register") {
                authenticator.registerUser(req, res);
            } else if (req.body.type === "login") {
                authenticator.loginUser(req, res);
            }
        } else if (req.url.includes("/refresh")) {
            authenticator.refreshAuth(req, res);
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
        // next();
    }
});

const users = require("./routes/users");
const rooms = require("./routes/rooms");
const app = require("./routes/app");
server.use("/users", users);
server.use("/rooms", rooms);
server.use("/app", app);

server.listen(config.port, () => console.log("It's alive on port", config.port));