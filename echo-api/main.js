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
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authentication")
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET");
    req.database = con;
    req.authenticator = authenticator;
    req.utils = require("./classes/utils");
    // check if headers have a token and if it's valid
    if (req.headers['Authentication']) {
        if (authenticator.checkToken(req.headers['Authentication'])) {
            return next();
        }
    } else {
        // check if url contains auth
        if (req.url.includes("/auth")) {
            // check if in body there is a type "register" or "login"
            console.log("Auth request")
            return next();
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
        // next();
    }
});

server.use("/users", require("./routes/users"));
server.use("/rooms", require("./routes/rooms"));
server.use("/app", require("./routes/app"));
server.use("/auth", require("./routes/auth"));

server.listen(config.port, () => console.log("API online and listening on port", config.port));