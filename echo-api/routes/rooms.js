const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    fetchRoomsWithUsers().then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        res.status(500).send(err);
    });    
});

function fetchOnlineUsersInRoom(roomId) {
    return new Promise((resolve, reject) => {
        var jsonOut = [];
        con.query("SELECT id, nick, img, stanza, lastIP FROM users WHERE online = 'T' AND NOT id=1 AND stanza = " + roomId, function (err, result, fields) {
            if (err) return reject(err);
            
            if (result.length > 0) {
                result.map(function (plate) {
                    jsonOut.push({
                        "id": plate.id,
                        "nick": plate.nick,
                        "img": plate.img,
                    });
                })
            }
            resolve(jsonOut)
        })
    })
}

function fetchRoomsWithUsers() {
    return new Promise ((resolve, reject) => {
        con.query("SELECT r.id, r.name, r.description, r.img, r.maxUsers FROM rooms as r WHERE NOT id=0 ORDER BY 'order'", async function (err, result, fields) {
            if (err) return reject(err)
    
            var jsonOut = [];
            if (result.length > 0) {
                for (var plate of result) {
                    const users = await fetchOnlineUsersInRoom(plate.id)
                    jsonOut.push({ 
                        "id" : plate.id,
                        "name" : plate.name,
                        "description" : plate.description,
                        "img" : plate.img,
                        "maxUser" : plate.maxUser,
                        "users": users,
                    });
                }
            }
            resolve(jsonOut)
        });
    })
}

module.exports = router;