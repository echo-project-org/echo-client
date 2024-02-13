const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const cors = require("cors");

const { Logger } = require("./classes/logger.js");
new Logger();

const cLoader = require("./classes/configLoader");
const config = new cLoader().getCfg();

const OAuth = require("./classes/auth");
const authenticator = new OAuth();

const SQL = require("./classes/mysql");
const database = new SQL(config);

// add body parser middleware for api requests
server.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
server.use(bodyParser.json({ limit: '5mb' }));

server.use(cors());

server.use((req, res, next) => {
    console.log('Got api request:', Date.now(), "Query:", req.url, "Method:", req.method);
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Expose-Headers", "Authorization");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (!req.authenticator) req.authenticator = authenticator;
    if (!req.utils) req.utils = require("./classes/utils");
    if (!req.database) req.database = database.getConnection();
    
    next();
});

server.use("/api/users", require("./routes/users"));
server.use("/api/rooms", require("./routes/rooms"));
// server.use("/api/app", require("./routes/app"));
server.use("/api/auth", require("./routes/auth"));
server.use("/api/servers", require("./routes/servers"));

server.listen(config.port, () => console.log("API online and listening on port", config.port));