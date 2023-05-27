var mysql = require('mysql'); 
const app = require('express')();
const {HOST, USER, PSW, DB} = require('./constants')
const PORT = 6980;

var verbose = true;

const print = (text) => {
    if (verbose) {
        console.log(text);
    }
}

app.listen(
    PORT,
    () => print("It's alive on http://localhost:" + PORT)
);

//Database stuff
var con = mysql.createConnection({
    host: HOST,
    user: USER,
    password: PSW,
    database: DB
});

con.connect(function(err) {
    if (err) throw err;
    print("Connected to database!");
});

//API endpoints
app.get('/test', (req, res) => {
    print("Test requested");
    res.header("Access-Control-Allow-Origin", "*");

    res.status(200).send({
        message: "The API is working!"
    })
});

app.get('/authenticateUser/:hash', (req, res) => {
    print("Authentication reqeusted");
    res.header("Access-Control-Allow-Origin", "*");

    const {hash} = req.params;

    con.query("SELECT id, nick FROM users WHERE hash='" + hash + "'", function (err, result, fields){
        if (err) {
            res.status(400).send({
                error: "You messed up the request."
            })
        }
        if(result.length > 0){
            res.status(200).send({
                id: result[0].id,
                nick: result[0].nick
            });
        } else {
            res.status(400).send({
                message: "Server address not found. WTF??"
            });
        }
    });
});

app.get('/getOnlineUsers', (req, res) => {
    print("Online users requested");
    res.header("Access-Control-Allow-Origin", "*");

    con.query("SELECT nick, img, stanza, lastIP FROM users WHERE online = 'T' AND NOT id=1", function (err, result, fields) {
        if (err) {
            res.status(400).send({
                error: "You messed up the request."
            })
        }

        var jsonOut = [];
        if(result.length > 0){
            result.map(function(plate) {        
                jsonOut.push({ 
                        "nick" : plate.nick,
                        "img" : plate.img,
                        "stanza" : plate.stanza,
                        "lastIP" : plate.lastIP,
                });
            })
            res.status(200).send(jsonOut);
        } else {
            res.status(200).send(jsonOut);
        }
    });
});

app.get('/setOnline/:nick/:status', (req, res) => {
    print("Set online requested");
    res.header("Access-Control-Allow-Origin", "*");

    var ip = req.header('x-forwarded-for') || req.socket.remoteAddress ;

    const {nick} = req.params;
    const {status} = req.params;

    con.query("UPDATE users SET online = '"+ status +"', lastSeen = CURRENT_TIMESTAMP(), lastIP = '" + ip + "' WHERE nick = '" + nick + "'", function (err, result, fields) {
        if (err) {
            res.status(400).send({
                error: "You messed up the request."
            })
        }

        res.status(200).send({
            message: "Status updated!"
        });
    });
})

app.get('/getUserVolumes/:nick', (req, res) => {
    print("User volumes requested");
    res.header("Access-Control-Allow-Origin", "*");

    const {nick} = req.params;

    con.query("SELECT otherUser, volume FROM userVolumes WHERE me='" + nick + "'", function (err, result, fields) {
        if (err) {
            res.status(400).send({
                error: "You messed up the request."
            })
        }

        var jsonOut = [];
        if(result.length > 0){
            result.map(function(volumes) {        
                jsonOut.push({ 
                        "nick" : volumes.otherUser,
                        "volume" : volumes.volume,
                });
            })
            res.status(200).send(jsonOut);
        } else {
            res.status(200).send(jsonOut);
        }
    });
})

app.get('/getUserVolume/:nick1/:nick2', (req, res) => {
    print("User volumes requested");
    res.header("Access-Control-Allow-Origin", "*");

    const {nick1} = req.params;
    const {nick2} = req.params;

    con.query("SELECT otherUser, volume FROM userVolumes WHERE me = '" + nick1 + "' AND otherUser = '" + nick2 + "'", function (err, result, fields) {
        if (err) {
            res.status(400).send({
                error: "You messed up the request."
            })
        }

        var jsonOut = [];
        if(result.length > 0){
            result.map(function(volumes) {        
                jsonOut.push({ 
                        "nick" : volumes.otherUser,
                        "volume" : volumes.volume,
                });
            })
            res.status(200).send(jsonOut);
        } else {
            res.status(200).send(jsonOut);
        }
    });
})

app.get('/setUserVolume/:nick1/:nick2/:volume', (req, res) => {
    print("User volumes requested");
    res.header("Access-Control-Allow-Origin", "*");

    const {nick1} = req.params;
    const {nick2} = req.params;
    const {volume} = req.params;


    con.query("INSERT INTO userVolumes (me, otherUser, volume) VALUES ('" + nick1 + "', '" + nick2 + "', '" + volume + "') ON DUPLICATE KEY UPDATE volume = " + volume, function (err, result, fields) {
        if (err) {
            res.status(400).send({
                error: "You messed up the request."
            })
        }

        res.status(200).send({
            message: "Volume updated!"
        });
    });
})

app.get('/getAudioServerAddress', (req, res) => {
    print("Online users requested");
    res.header("Access-Control-Allow-Origin", "*");

    con.query("SELECT lastIP FROM users WHERE id=1", function (err, result, fields) {
        if (err) {
            res.status(400).send({
                error: "You messed up the request."
            })
        }

        if(result.length > 0){
            res.status(200).send({
                address: result[0].lastIP,
                port: 6981
            });
        } else {
            res.status(400).send({
                message: "Server address not found. WTF??"
            });
        }
    });
});

app.get('/getAudioSettings', (req, res) => {
    print("Online users requested");
    res.header("Access-Control-Allow-Origin", "*");

    con.query("SELECT sampleRate, bits, channels FROM audioSettings WHERE id=1", function (err, result, fields) {
        if (err) {
            res.status(400).send({
                error: "You messed up the request."
            })
        }

        if(result.length > 0){
            res.status(200).send({
                sampleRate: result[0].sampleRate,
                bits: result[0].bits,
                channels: result[0].channels
            });
        } else {
            res.status(400).send({
                message: "Audio settings not found. WTF??"
            });
        }
    });
});

app.get('/getLastUpdaterVersion', (req, res) => {
    print("Updater version requested");
    res.header("Access-Control-Allow-Origin", "*");

    con.query("SELECT id, downloadUrl FROM updaterVersions order by id desc limit 1", function (err, result, fields) {
        if (err) {
            res.status(400).send({
                error: "You messed up the request."
            })
        }

        if(result.length > 0){
            res.status(200).send({
                version: result[0].id,
                url: result[0].downloadUrl,
            });
        } else {
            res.status(400).send({
                message: "Server address not found. WTF??"
            });
        }
    });
});

app.get('/getLastAppVersion', (req, res) => {
    print("App version requested");
    res.header("Access-Control-Allow-Origin", "*");

    con.query("SELECT id, downloadUrl FROM timspikVersions order by id desc limit 1", function (err, result, fields) {
        if (err) {
            res.status(400).send({
                error: "You messed up the request."
            })
        }

        if(result.length > 0){
            res.status(200).send({
                version: result[0].id,
                url: result[0].downloadUrl,
            });
        } else {
            res.status(400).send({
                message: "Server address not found. WTF??"
            });
        }
    });
});

app.get('/addUser/:nick/:url/:hash', (req, res) => {
    print("User volumes requested");
    res.header("Access-Control-Allow-Origin", "*");

    const {nick} = req.params;
    const {url} = req.params;
    const {hash} = req.params;
    con.query("REPLACE INTO users SET nick = '" + nick + "', img = '" + url + "', firstJoin = NOW(), hash = '" + hash + "';", function (err, result, fields) {
        if (err) {
            res.status(400).send({
                error: "You messed up the request."
            })
        } else {
            res.status(200).send({
                message: "User added"
            });
        }
    });
})