const express = require("express");
const router = express.Router();

router.use((req, res, next) => {
    const body = req.authenticator.checkToken(req, res);
    if (!body) return res.status(401).send({ message: "You are not authorized to do this." });
    if (body.scope !== "self") return res.status(401).send({ message: "You are not authorized to do this." });

    next();
});

router.get('/:serverId', (req, res) => {
    const { serverId } = req.params;
    if (!serverId) return res.status(400).json({ message: "Provide a valid server id" });
    req.database.query("SELECT id, name, description, maxUsers FROM rooms WHERE serverId = ? ORDER BY id", [serverId], (err, result, fields) => {
        if (err) return console.error(err);

        var jsonOut = [];
        if (result.length > 0) {
            result.forEach((plate) => {
                jsonOut.push({
                    id: plate.id,
                    name: plate.name,
                    description: plate.description,
                    maxUsers: plate.maxUsers
                });
            });
        } else {
            return res.status(400).json({ message: "No rooms found for the provided server id" });
        }
        return res.json(jsonOut);
    });
});

router.get('/:serverId/:id', (req, res) => {
    const { serverId, id } = req.params;
    if (!serverId) return res.status(400).json({ message: "Provide a valid server id" });
    if (!id) return res.status(400).json({ message: "Provide a valid room id" });

    req.database.query("SELECT id, name, description, maxUsers FROM rooms WHERE id = ? AND serverId = ?", [id, serverId], (err, result, fields) => {
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
        } else {
            return res.status(400).json({ message: "No room found with the provided id" });
        }
    });
});

// create new room
router.post('/', (req, res) => {
    const { serverId, name, description, maxUsers } = req.body;
    if (!serverId || !name || !description || !maxUsers) return res.status(400).json({ message: "Provide a valid room id" });

    req.database.query("INSERT INTO rooms (serverId, name, description, maxUsers) VALUES (?, ?, ?, ?)", [serverId, name, description, maxUsers], (err, result, fields) => {
        if (err) {
            res.status(400).json({ message: "Error creating the room!" });
            return console.error(err);
        }
        res.json({ message: "Room created!" });
    });
});

// join room
router.post('/join', (req, res) => {
    const { serverId, userId, roomId } = req.body;
    if (!serverId || !roomId || !userId) return res.status(400).json({ message: "Provide a valid room id" });

    // if user is already in room, remove it
    req.database.query("DELETE FROM room_users WHERE userId = ?", [userId], (err, result, fields) => {
        if (err) return console.error(err);
    });

    if (roomId === "0") return res.json({ message: "Left room" });
    // if room id is 0, then the user has left all rooms
    if (roomId !== "0") {
        // add user to joining room
        req.database.query("INSERT INTO room_users (roomId, userId, serverId) VALUES (?, ?, ?)", [roomId, userId, serverId], (err, result, fields) => {
            if (err) return console.error(err);
            // send complete room data back to client
            req.database.query("SELECT users.id, users.name, users.img FROM users INNER JOIN room_users ON users.id = room_users.userId WHERE room_users.roomId = ? AND room_users.serverId = ?", [roomId, serverId], (err, result, fields) => {
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
                return res.json(jsonOut);
            });
        });
    }
});

// get users in room
router.get('/:id/:serverId/users', (req, res) => {
    const { id, serverId } = req.params;
    if (!id) return res.status(400).json({ message: "Provide a valid room id" });
    if (!serverId) return res.status(400).json({ message: "Provide a valid server id" });

    req.database.query(`
        SELECT users.id, users.name, users.img, users.online, user_status.status
        FROM users
        INNER JOIN room_users ON users.id = room_users.userId
        INNER JOIN user_status ON users.id = user_status.userId
        WHERE room_users.roomId = ? AND serverId = ?
    `, [id, serverId], (err, result, fields) => {
        if (err) return console.error(err);

        var jsonOut = [];
        if (result.length > 0) {
            result.forEach((plate) => {
                jsonOut.push({
                    id: plate.id,
                    name: plate.name,
                    img: plate.img,
                    online: plate.online,
                    status: plate.status
                });
            });
        }

        return res.json(jsonOut);
    });
});

router.get('/:id/:serverId/messages', (req, res) => {
    const { id, serverId } = req.params;
    if (!id) return res.status(400).json({ message: "Provide a valid room id" });
    if (!serverId) return res.status(400).json({ message: "Provide a valid server id" });

    // TODO: request previous 50 messages if scrolling up
    req.database.query(`
        SELECT
            room_messages.id,
            room_messages.message,
            room_messages.userId,
            room_messages.date,
            room_messages.insertDate,
            users.name,
            users.img
        FROM room_messages
        INNER JOIN users ON room_messages.userId = users.id
        WHERE room_messages.roomId = ? AND room_messages.serverId = ?
        ORDER BY room_messages.id ASC
        LIMIT 50
    `, [id, serverId], (err, result, fields) => {
        if (err) return console.error(err);

        var jsonOut = [];
        if (result.length > 0) {
            result.forEach((plate) => {
                jsonOut.push({
                    id: plate.id,
                    message: plate.message,
                    userId: plate.userId,
                    name: plate.name,
                    img: plate.img,
                    date: plate.date,
                    insertDate: plate.insertDate
                });
            });
        }
        res.json(jsonOut);
    });
});

router.post('/messages', (req, res) => {
    const { roomId, userId, serverId, message, } = req.body;
    if (!roomId) return res.status(400).json({ message: "Provide a valid room id" });
    if (!userId) return res.status(400).json({ message: "Provide a valid user id" });
    if (!serverId) return res.status(400).json({ message: "Provide a valid server id" });
    if (!message) return res.status(400).json({ message: "Provide a valid message" });
    
    // transform js date to mysql date
    // const jsDate = new Date(date);
    // const mysqlDate = jsDate.toISOString().slice(0, 19).replace('T', ' ');

    req.database.query("INSERT INTO room_messages (roomId, userId, serverId, message) VALUES (?, ?, ?, ?)", [roomId, userId, serverId, message], (err, result, fields) => {
        if (err) {
            res.status(400).json({ message: "Error sending the message!" });
            return console.error(err);
        }
        res.json({ message: "Message sent!" });
    });
});

module.exports = router;