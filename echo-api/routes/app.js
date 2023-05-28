const express = require("express");
const router = express.Router();

router.get('/socket', (req, res) => {
    con.query("SELECT lastIP FROM users WHERE id = 1", function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." });

        if (result.length > 0) {
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

router.get('/settings', (req, res) => {
    con.query("SELECT sampleRate, bits, channels FROM audioSettings WHERE id = 1", function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." });

        if (result.length > 0) {
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

router.get('/version', (req, res) => {
    con.query("SELECT id, downloadUrl FROM updaterVersions order by id desc limit 1", function (err, result, fields) {
        if (err) return res.status(400).send({ error: "You messed up the request." });

        if (result.length > 0) {
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

// router.get('/ve', (req, res) => {
//     con.query("SELECT id, downloadUrl FROM timspikVersions order by id desc limit 1", function (err, result, fields) {
//         if (err) return res.status(400).send({ error: "You messed up the request." });

//         if (result.length > 0) {
//             res.status(200).send({
//                 version: result[0].id,
//                 url: result[0].downloadUrl,
//             });
//         } else {
//             res.status(400).send({
//                 message: "Server address not found. WTF??"
//             });
//         }
//     });
// });

module.exports = router;