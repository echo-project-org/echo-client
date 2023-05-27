const express = require("express");
const router = express.Router();

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

router.post('/:nick/:status/:room', (req, res) => {
    var ip = req.header('x-forwarded-for') || req.socket.remoteAddress;

    const { nick } = req.params;
    const { status } = req.params;
    const { room } = req.params;

    con.query("UPDATE users SET online = '"+ status +"', lastSeen = CURRENT_TIMESTAMP(), lastIP = '" + ip + "', stanza = '" + room + "' WHERE nick = '" + nick + "'", function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." })
        res.status(200).send({  message: "Status updated!" });
    });
});

router.get('/add/:nick/:url/:hash', (req, res) => {
    const { nick } = req.params;
    const { url } = req.params;
    const { hash } = req.params;

    con.query("REPLACE INTO users SET nick = '" + nick + "', img = '" + url + "', firstJoin = NOW(), hash = '" + hash + "';", function (err, result, fields) {
        if (err) res.status(400).send({ error: "You messed up the request." });
        else res.status(200).send({ message: "User added" });
    });
});

router.post('/volume/:nick1/:nick2/:volume', (req, res) => {
    const { nick1 } = req.params;
    const { nick2 } = req.params;
    const { volume } = req.params;

    con.query("INSERT INTO userVolumes (me, otherUser, volume) VALUES ('" + nick1 + "', '" + nick2 + "', '" + volume + "') ON DUPLICATE KEY UPDATE volume = " + volume, function (err, result, fields) {
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

// get volume level of specific user
router.get('/volume/:nick1/:nick2', (req, res) => {
    const { nick1 } = req.params;
    const { nick2 } = req.params;

    con.query("SELECT otherUser, volume FROM userVolumes WHERE me = '" + nick1 + "' AND otherUser = '" + nick2 + "'", function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." });

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

module.exports = router;