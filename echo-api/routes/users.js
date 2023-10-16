const express = require("express");
const router = express.Router();
const fs = require("fs");

router.get("/:id", (req, res) => {
    if(!req.authenticator.checkAuth(req, res)) return;

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
    if(!req.authenticator.checkAuth(req, res)) return;

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
    if(!req.authenticator.checkAuth(req, res)) return;

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

// router.get("/rooms", (req, res) => {
//     if(!req.authenticator.checkAuth(req, res)) return;
   
//     req.database.query("SELECT * FROM room_users")
// });

// router.get("/friends/:id", (req, res) => {
//     if(!req.authenticator.checkAuth(req, res)) return;
    
//     const { id } = req.query;
//     if (!id) return res.status(400).send({ message: "You messed up the request." });

//     req.database.query("SELECT u.name, u.online, u.id FROM users u, userFriends uf WHERE uf.id = ? AND u.id = uf.otherId", [id], (err, result, fields) => {
//         if (err) return res.status(400).send({ error: "You messed up the request." });

//         var jsonOut = [];
//         if (result.length > 0) {
//             result.map((plate) => {
//                 jsonOut.push({
//                     id: plate.id,
//                     name: plate.name,
//                     online: plate.online,
//                 });
//             })
//         }
//         res.status(200).send(jsonOut);
//     });
// });

router.get("/status/:id", (req, res) => {
    if(!req.authenticator.checkAuth(req, res)) return;

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
    if(!req.authenticator.checkAuth(req, res)) return;
    
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
    if(!req.authenticator.checkAuth(req, res)) return;
    
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
    if(!req.authenticator.checkAuth(req, res)) return;
    
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
    if(!req.authenticator.checkAuth(req, res)) return;
    
    const { name } = req.params;

    req.database.query("SELECT otherUser, volume FROM userVolumes WHERE me = ?", [name], function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." });

        var jsonOut = [];
        if (result.length > 0) {
            result.map(function(volumes) {        
                jsonOut.push({ 
                    "name" : volumes.otherUser,
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
    if(!req.authenticator.checkAuth(req, res)) return;
    
    const { nick1 } = req.params;
    const { nick2 } = req.params;

    req.database.query("SELECT otherUser, volume FROM userVolumes WHERE me = '" + nick1 + "' AND otherUser = '" + nick2 + "'", function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." });

        var jsonOut = [];
        if (result.length > 0) {
            result.map(function(volumes) {        
                jsonOut.push({
                    "name" : volumes.otherUser,
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