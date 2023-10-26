const express = require("express");
const router = express.Router();
const fs = require("fs");

router.use((req, res, next) => {
    const body = req.authenticator.checkToken(req, res);
    if (!body) return res.status(401).send({ message: "You are not authorized to do this." });
    if (body.scope !== "self") return res.status(401).send({ message: "You are not authorized to do this." });

    next();
});

router.get('/', (req, res) => {
    res.status(200).send({ message: "pong" });
});

router.get("/:id", (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).send({ message: "You messed up the request." });

    req.database.query("SELECT * FROM users WHERE id = ?", [id], (err, result, fields) => {
        if (err) return res.status(400).send({ error: "You messed up the request." });
        if (result.length > 0) {
            res.status(200).send(result[0]);
        } else {
            res.status(404).send({ error: "User not found." });
        }
    });
});

router.get("/image/:id", (req, res) => {
    var { id } = req.params;
    // maybe good? IDK
    if (id.includes(".")) id = id.split(".")[0];
    // get image from file system
    fs.readFile("./images/" + id + ".png", function (err, data) {
        if (err) {
            console.log(err);
            res.status(400).send({ message: "Error reading image" });
        } else {
            res.writeHead(200, { "Content-Type": "image/png" });
            res.end(data);
        }
    });

    // res.status(404).send("File not found");
});

router.post("/image", (req, res) => {
    const { id, image } = req.body;
    if (!id || !image) return res.status(400).send({ message: "You messed up the request." });

    // save image (base64 of file) to file system
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    fs.writeFile("./images/" + id + ".png", base64Data, "base64", function (err) {
        if (err) {
            console.log(err);
            res.status(400).send({ message: "Error saving image" });
        } else {
            const imgUrl = "https://echo.kuricki.com/api/users/image/" + id + ".png";
            req.database.query("UPDATE users SET img = ? WHERE id = ?", [imgUrl, id], (err, result, fields) => {
                // console.log(err);
                if (err) return res.status(400).send({ error: "You messed up the request." });
                res.status(200).send({ message: "Image updated!", url: imgUrl });
            });
        }
    });
});

router.get("/status/:id", (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).send({ message: "You messed up the request." });

    req.database.query("SELECT online FROM users WHERE id = ?", [id], (err, user, fields) => {
        if (err) return res.status(400).send({ error: "You messed up the request." });
        if (user.length > 0) {
            if (user[0].online === "1") {
                req.database.query("SELECT status FROM user_status WHERE userId = ?", [id], (err, result, fields) => {
                    if (err) return res.status(400).send({ error: "You messed up the request." });
                    if (result.length > 0) {
                        res.status(200).send({ status: result[0].status });
                    } else {
                        res.status(404).send({ error: "User not found." });
                    }
                });
            }
        } else {
            res.status(404).send({ error: "User not found." });
        }
    });
});

// update user status
router.post('/status', (req, res) => {
    // const ip = req.header('x-forwarded-for') || req.socket.remoteAddress;
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).send({ message: "You messed up the request." });

    // set online status of user to offline
    req.database.query("UPDATE users SET online = ? WHERE id = ?", [status, id], function (err, result, fields) {
        if (err) console.log(err);

        // remove user from any rooms
        if (status === "0")
            req.database.query("DELETE FROM room_users WHERE userId = ?", [id], function (err, result, fields) {
                if (err) console.log(err);
            });
        res.status(200).send({ message: "You are now offline!" });
    });
});

router.post("/customStatus", (req, res) => {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).send({ message: "You messed up the request." });

    // update user status
    req.database.query("UPDATE user_status SET status = ? WHERE userId = ?", [status, id], (err, result, fields) => {
        if (err) console.log(err);
        if (err) return res.status(500).send({ error: "You messed up the request." });
        res.status(200).send({ message: "Status updated!" });
    });
});

// update volume value of existing user
router.post('/volume', (req, res) => {
    const body = req.body;
    const id = body.id;
    const user = body.status;
    const volume = body.room;

    req.database.query("INSERT INTO userVolumes (me, otherUser, volume) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE volume = ?", [id, user, volume, volume], function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." });
        res.status(200).send({ message: "Volume updated!" });
    });
})

// get personal volume levels from user id
router.get('/volume/:name', (req, res) => {
    const { name } = req.params;

    req.database.query("SELECT otherUser, volume FROM userVolumes WHERE me = ?", [name], function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." });

        var jsonOut = [];
        if (result.length > 0) {
            result.map(function (volumes) {
                jsonOut.push({
                    "name": volumes.otherUser,
                    "volume": volumes.volume,
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
    const { nick1, nick2 } = req.params;

    req.database.query("SELECT otherUser, volume FROM userVolumes WHERE me = ? AND otherUser = ?", [nick1, nick2], function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." });

        var jsonOut = [];
        if (result.length > 0) {
            result.map(function (volumes) {
                jsonOut.push({
                    "name": volumes.otherUser,
                    "volume": volumes.volume,
                });
            })
            res.status(200).send(jsonOut);
        } else {
            res.status(200).send(jsonOut);
        }
    });
});

// get friends of user
router.get('/friends/:id', (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).send({ message: "You messed up the request." });

    req.database.query("SELECT otherId FROM user_friends WHERE id = ? AND id IN (SELECT otherId WHERE id = ?)", [id, id], function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." });

        var jsonOut = [];
        if (result.length > 0) {
            result.map(function (friends) {
                jsonOut.push({
                    "id": friends.otherId,
                });
            })
            res.status(200).send(jsonOut);
        } else {
            res.status(200).send(jsonOut);
        }
    });
})

// get friend requests of user
router.get('/friends/requests/:id', (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).send({ message: "You messed up the request." });

    req.database.query("SELECT id FROM user_friends WHERE otherId = ? AND id NOT IN (SELECT otherId WHERE id = ?)", [id, id], function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." });

        var jsonOut = [];
        if (result.length > 0) {
            result.map(function (friends) {
                jsonOut.push({
                    "id": friends.id,
                });
            })
            res.status(200).send(jsonOut);
        } else {
            res.status(200).send(jsonOut);
        }
    });
});

router.get('/friends/sentRequests/:id', (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).send({ message: "You messed up the request." });

    req.database.query("SELECT otherId as id FROM user_friends WHERE id = ? AND id NOT IN (SELECT id WHERE otherId = ?)", [id, id], function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." });

        var jsonOut = [];
        if (result.length > 0) {
            result.map(function (friends) {
                jsonOut.push({
                    "id": friends.id,
                });
            })
            res.status(200).send(jsonOut);
        } else {
            res.status(200).send(jsonOut);
        }
    });
});

// operation on friend request
router.post('/friend/request', (req, res) => {
    const body = req.body;
    const id = body.id;
    const friendId = body.friendId;
    const operation = body.operation;

    if (!id || !friendId || !operation) return res.status(400).send({ message: "You messed up the request." });

    switch (operation) {
        case "add":
            req.database.query("INSERT INTO user_friends (id, otherId) VALUES (?, ?)", [id, friendId], function (err, result, fields) {
                if (err) return res.status(400).send({ error: "You messed up the request." });
                res.status(200).send({ message: "Friend added!" });
            });
            break;
        case "remove":
            req.database.query("DELETE FROM user_friends WHERE id = ? AND otherId = ? || id= ? AND otherId = ?", [id, friendId, friendId, id], function (err, result, fields) {
                if (err) return res.status(400).send({ error: "You messed up the request." });
                res.status(200).send({ message: "Friend removed!" });
            });
            break;
        default:
            res.status(404).send({ message: "Unknown operation." });
            break;
    }
});

module.exports = router;