var mysql = require('mysql'); 
const app = require('express')();

const config = require("./config.json");

require("./classes/logger");

const con = mysql.createConnection(config.database);
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to database!");
});

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    console.log('Got api request:', Date.now(), "Query:", req.query);
    req.database = con;
    next();
})

const users = require("./routes/users");
const auth = require("./routes/auth");
const rooms = require("./routes/rooms");
const app = require("./routes/app");
app.use("/users", users);
app.use("/auth", auth);
app.use("/rooms", rooms);
app.use("/app", app);

app.listen(config.port, () => console.log("It's alive on port", config.port));