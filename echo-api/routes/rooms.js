const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    if(!req.authenticator.checkAuth(req, res)) return;

    req.database.query("SELECT id, name, description, maxUsers FROM rooms ORDER BY id", [], (err, result, fields) => {
        if (err) return console.error(err);

        var jsonOut = [];
        if (result.length > 0) {
            result.forEach((plate) => {
                jsonOut.push({
                    id: plate.id,
                    name: plate.name,
                    description: plate.description,
                    img: plate.img,
                    maxUser: plate.maxUsers
                });
            });
        }
        res.json(jsonOut);
    });
});

router.get('/:id', (req, res) => {
    if(!req.authenticator.checkAuth(req, res)) return;

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Provide a valid room id" });

    req.database.query("SELECT id, name, description, maxUsers FROM rooms WHERE id = ?", [req.params.id], (err, result, fields) => {
        if (err) return console.error(err);
    
        if (result.length > 0) {
            const plate = result[0];
            res.json({
                id: plate.id,
                name: plate.name,
                description: plate.description,
                img: plate.img,
                maxUser: plate.maxUsers
            });
        }
    });
});

// create new room
router.post('/', (req, res) => {
    if(!req.authenticator.checkAuth(req, res)) return;

    const { name, description, maxUsers } = req.body;
    if (!name || !description || !maxUsers) return res.status(400).json({ message: "Provide a valid room id" });

    req.database.query("INSERT INTO rooms (name, description, maxUsers) VALUES (?, ?, ?)", [name, description, maxUsers], (err, result, fields) => {
        if (err) return console.error(err);
        res.json({ message: "Room created!" });
    });
});

// join room
router.post('/join', (req, res) => {
    if(!req.authenticator.checkAuth(req, res)) return;

    const { userId, roomId } = req.body;
    if (!roomId || !userId) return res.status(400).json({ message: "Provide a valid room id" });

    // if user is already in room, remove it
    req.database.query("DELETE FROM room_users WHERE userId = ?", [userId], (err, result, fields) => {
        if (err) return console.error(err);
        if (roomId === "0") return res.json({ message: "Left room" });
    });

    // if room id is 0, then the user has left all rooms
    if (roomId !== "0")
        // add user to joining room
        req.database.query("INSERT INTO room_users (roomId, userId) VALUES (?, ?)", [roomId, userId], (err, result, fields) => {
            if (err) return console.error(err);
            // send complete room data back to client
            req.database.query("SELECT users.id, users.name, users.img FROM users INNER JOIN room_users ON users.id = room_users.userId WHERE room_users.roomId = ?", [roomId], (err, result, fields) => {
                if (err) return console.error(err);
        
                var jsonOut = [];
                if (result.length > 0) {
                    result.forEach((plate) => {
                        jsonOut.push({
                            id: plate.id,
                            name: plate.name,
                            img: plate.img
                        });
                    });
                }
                res.json(jsonOut);
            });
        });
});
    

router.get('/:id/users', (req, res) => {
    if(!req.authenticator.checkAuth(req, res)) return;

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Provide a valid room id" });

    req.database.query("SELECT users.id, users.name, users.img FROM users INNER JOIN room_users ON users.id = room_users.userId WHERE room_users.roomId = ?", [id], (err, result, fields) => {
        if (err) return console.error(err);

        var jsonOut = [];
        if (result.length > 0) {
            result.forEach((plate) => {
                jsonOut.push({
                    id: plate.id,
                    name: plate.name,
                    img: plate.img
                });
            });
        }
        res.json(jsonOut);
    });
});

module.exports = router;