const express = require("express");
const router = express.Router();
const fs = require("fs");

router.use((req, res, next) => {
    // check if endpoint starts with /image
    if (req.path.startsWith("/image")) return next();

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

    req.database.query(`
        SELECT users.id, users.name, users.email, users.img, users.online, user_status.status, users.firstJoin, users.lastSeen
        FROM users
        LEFT JOIN user_status ON userId = id
        WHERE id = ?
    `, [id], (err, result, fields) => {
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
            res.writeHead(200, { "Content-Type": "image/*,image/png" });
            res.end(data);
        }
    });

    // res.status(404).send("File not found");
});

router.post("/image", (req, res) => {
    const { id, image } = req.body;
    if (!id || !image) return res.status(400).send({ message: "You messed up the request." });

    // save image (base64 of file) to file system from jpeg
    // const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
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

    req.database.query(`
        SELECT
            CASE
                WHEN f1.id = ? AND f2.id IS NOT NULL THEN 'friend'
                WHEN f2.id = ? AND f1.id IS NOT NULL THEN 'friend'
                WHEN f1.id = ? AND f2.id IS NULL THEN 'sent'
                WHEN f2.id = ? AND f1.id IS NULL THEN 'incoming'
                ELSE 'incoming'
            END AS relationship,
            CASE
                WHEN f1.id = ? THEN f1.otherId
                ELSE f1.id
            END AS otherUserId,
            u.name AS otherUsername,
            u.img AS otherUserImage,
            CASE
                WHEN u.online = '1' THEN us.status
                ELSE '0'
            END AS otherUserStatus,
            f1.otherId AS otherId
        FROM user_friends f1
        LEFT JOIN user_friends f2 ON (f1.id = f2.otherId AND f1.otherId = f2.id)
        LEFT JOIN users u ON u.id = CASE WHEN f1.id = ? THEN f1.otherId ELSE f1.id END
        LEFT JOIN user_status us ON us.userId = CASE WHEN f1.id = ? THEN f1.otherId ELSE f1.id END
        WHERE f1.id = ? OR f1.otherId = ?;
    `, [id, id, id, id, id, id, id, id, id], function (err, result, fields) {
        if (err) {
            console.error(err);
            return res.status(400).send({ error: "You messed up the request." });
        }

        const friendMap = {
            friended: [],
            sent: [],
            incoming: [],
        };
        if (result.length > 0) {
            result.map((friends) => {
                // check if user is friended by other user
                if (friends.relationship === "friend" && friends.otherId !== Number(id)) {
                    friendMap.friended.push({
                        id: friends.otherUserId,
                        img: friends.otherUserImage,
                        name: friends.otherUsername,
                        status: friends.otherUserStatus,
                    })
                } else
                // check if user sent friend request
                if (friends.relationship === "sent") {
                    friendMap.sent.push({
                        id: friends.otherUserId,
                        img: friends.otherUserImage,
                        name: friends.otherUsername,
                        // status: friends.otherUserStatus,
                        status: "-1",
                    })
                } else
                // check if user has incoming friend request
                if (friends.relationship === "incoming") {
                    friendMap.incoming.push({
                        id: friends.otherUserId,
                        img: friends.otherUserImage,
                        name: friends.otherUsername,
                        // status: friends.otherUserStatus,
                        status: "-1",
                    })
                }
            });
            res.status(200).send(friendMap);
        } else {
            res.status(200).send(friendMap);
        }
    });
})

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
                if (err) {
                    console.error(err);
                    return res.status(400).send({ error: "You messed up the request." });
                }
                res.status(200).send({ message: "Friend added!" });
            });
            break;
        case "remove":
            req.database.query("DELETE FROM user_friends WHERE id = ? AND otherId = ? || id= ? AND otherId = ?", [id, friendId, friendId, id], function (err, result, fields) {
                if (err) {
                    console.error(err);
                    return res.status(400).send({ error: "You messed up the request." });
                }
                res.status(200).send({ message: "Friend removed!" });
            });
            break;
        default:
            res.status(404).send({ message: "Unknown operation." });
            break;
    }
});

module.exports = router;