var mysql = require('mysql'); 
const express = require('express');
const server = express();
const bodyParser = require('body-parser');

const config = require("./config.json");

require("./classes/logger");

const con = mysql.createConnection(config.database);
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to database!");
});

// not gud
// app.use(express.json());
// old express version
// server.use(express.bodyParser());
server.use(bodyParser);

server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    console.log('Got api request:', Date.now(), "Query:", req.query);
    req.database = con;
    next();
})

const users = require("./routes/users");
const auth = require("./routes/auth");
const rooms = require("./routes/rooms");
const app = require("./routes/app");
server.use("/users", users);
server.use("/auth", auth);
server.use("/rooms", rooms);
server.use("/app", app);

server.listen(config.port, () => console.log("It's alive on port", config.port));