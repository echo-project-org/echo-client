const express = require("express");
const router = express.Router();
const fs = require("fs");

router.get("/image/:id", (req, res) => {
    var { id } = req.params;
    // check if reqeust has .png at the end, if it does remove it
    if (id.endsWith(".png")) id = id.substring(0, id.length - 4);
    // check if file contains png, if not check if the one without png exists then send it
    if (fs.existsSync("./images/" + id + ".png")) {
        res.sendFile("./images/" + id + ".png", { root: __dirname + "/../" });
        return;
    }
    if (fs.existsSync("./images/" + id)) {
        res.sendFile("./images/" + id, { root: __dirname + "/../" });
        return;
    }
    res.status(404).send("File not found");
});

router.post("/image/:id", (req, res) => {
    var { id } = req.params;
    if (id.endsWith(".png")) id = id.substring(0, id.length - 4);
    var base64Data = req.body.img.replace(/^data:image\/png;base64,/, "");
    fs.writeFile("./images/" + id + ".png", base64Data, "base64", function (err) {
        if (err) {
            console.log(err);
            res.status(400).send("Error saving image");
        } else {
            res.status(200).send("Image saved");
        }
    });
});

// get user
router.get('/', (req, res) => {
    con.query("SELECT nick, img, stanza, lastIP FROM users WHERE online = 'T' AND NOT id = 1", function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." });

        var jsonOut = [];
        if (result.length > 0) {
            result.map(function(plate) {        
                jsonOut.push({ 
                    "nick" : plate.nick,
                    "img" : plate.img,
                    "room" : plate.stanza,
                    "lastIP" : plate.lastIP,
                });
            })
        }
        res.status(200).send(jsonOut);
    });
});

// create new user
router.post('/', (req, res) => {
    const body = req.body;
    const id = body.id;
    const url = body.status;
    const hash = body.room;

    con.query("REPLACE INTO users SET nick = '" + id + "', img = '" + url + "', firstJoin = NOW(), hash = '" + hash + "';", function (err, result, fields) {
        if (err) res.status(400).send({ error: "You messed up the request." });
        else res.status(200).send({ message: "User added" });
    });
});

// update an existing user
router.post('/update', (req, res) => {
    var ip = req.header('x-forwarded-for') || req.socket.remoteAddress;

    const body = req.body;
    const id = body.id;
    const status = body.status;
    const room = body.room;

    con.query("UPDATE users SET online = '"+ status +"', lastSeen = CURRENT_TIMESTAMP(), lastIP = '" + ip + "', stanza = '" + room + "' WHERE nick = '" + id + "'", function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." })
        res.status(200).send({  message: "Status updated!" });
    });
});

// update volume value of existing user
router.post('/volume', (req, res) => {
    const body = req.body;
    const id = body.id;
    const user = body.status;
    const volume = body.room;

    con.query("INSERT INTO userVolumes (me, otherUser, volume) VALUES ('" + id + "', '" + user + "', '" + volume + "') ON DUPLICATE KEY UPDATE volume = " + volume, function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." });
        res.status(200).send({ message: "Volume updated!" });
    });
})

// get personal volume levels from user id
router.get('/volume/:nick', (req, res) => {
    const { nick } = req.params;

    con.query("SELECT otherUser, volume FROM userVolumes WHERE me = '" + nick + "'", function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." });

        var jsonOut = [];
        if (result.length > 0) {
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

// get volume level of specific user
router.get('/volume/:nick1/:nick2', (req, res) => {
    const { nick1 } = req.params;
    const { nick2 } = req.params;

    con.query("SELECT otherUser, volume FROM userVolumes WHERE me = '" + nick1 + "' AND otherUser = '" + nick2 + "'", function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." });

        var jsonOut = [];
        if (result.length > 0) {
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

module.exports = router;