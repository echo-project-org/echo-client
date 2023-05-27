const express = require("express");
const router = express.Router();

router.get('/auth/:hash', (req, res) => {
    const { hash } = req.params;

    con.query("SELECT id, nick FROM users WHERE hash='" + hash + "'", function (err, result, fields){
        if (err) res.status(400).send({ error: "You messed up the request." });

        if (result.length > 0) {
            res.status(200).send({
                id: result[0].id,
                nick: result[0].nick
            });
        } else {
            res.status(400).send({ message: "Server address not found. WTF??" });
        }
    });
});

module.exports = router;