const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    fetchRoomsWithUsers(req, res).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        res.status(500).send(err);
    });
});

function fetchOnlineUsers(req, res) {
    return new Promise((resolve, reject) => {
        var jsonOut = new Map();
        req.database.query("SELECT id, name, img, online, currentRoom FROM users WHERE online = ?", [1], (err, result, fields) => {
            if (err) return reject(err);
            
            if (result.length > 0) {
                result.map((plate) => {
                    jsonOut.set(plate.currentRoom, {
                        id: plate.id,
                        name: plate.name,
                        img: plate.img,
                        online: plate.online,
                        currentRoom: plate.currentRoom,
                    });
                })
            }
            resolve(jsonOut)
        })
    })
}

function fetchRoomsWithUsers(req, res) {
    return new Promise ((resolve, reject) => {
        req.database.query("SELECT id, name, description, maxUsers FROM rooms ORDER BY id", [], (err, result, fields) => {
            if (err) return reject(err)
    
            var jsonOut = [];
            if (result.length > 0) {
                fetchOnlineUsers(req, res)
                    .then((users) => {
                        for (plate of result) {
                            jsonOut.push({
                                id: plate.id,
                                name: plate.name,
                                description: plate.description,
                                img: plate.img,
                                maxUser: plate.maxUser,
                                users: users.get(plate.id),
                            });
                        }
                        resolve(jsonOut)
                    })
            }
        });
    })
}

module.exports = router;