const at = require('./audioTransmitter');
const ar = require('./audioReceiver');

const io = require("socket.io-client");
var socket;

// socket.onmessage = function (event) {
//     parseMessage(event.data)
// };

// socket.onclose = function (event) {
//     if (event.wasClean) {
//         //If closing was clean
//     } else {
//         // alert('Connection with the server died');
//     }
    
//     at.stopAudioStream();
// };

// // when found connection and enstablishing a new connection

// // attempt in reconnection
// socket.io.on("reconnect_attempt", (attempt) => {
//     alert("reconnecting. attempt " + attempt)
// });

// socket.io.on("reconnect", (attempt) => {});
// socket.io.on("reconnect_error", (error) => {});
// socket.io.on("reconnect_failed", () => {});

// // errors

export async function openConnection(id) {
    socket = io("ws://kury.ddns.net:6982");
    
    socket.on("open", (event) => {
        console.log("opened");
        ar.startOutputAudioStream(id)
        socket.emit("join", id);
    });

    socket.on("receiveAudioPacket", (data) => {
        var lc = new Float32Array(data.left);
        var rc = new Float32Array(data.right);

        ar.addToBuffer(data.id, lc, rc);
    });

    socket.io.on("close", () => {
        console.log("connection closed");
        at.stopAudioStream();
    })
    
    socket.io.on("error", (error) => {
        console.log(error);
        alert("The audio server connection has errored out")
        at.stopAudioStream();
    });

    socket.io.on("ping", () => { console.log("pong") });
}

export async function closeConnection(id) {
    if(socket){
        socket.send("ECHO QUIT " + id);
        socket.close();
    }
}

export async function sendMessage(msg) {
    if (socket) {
        // socket.send("ECHO MSG" + msg);
    }
}

export async function sendAudioPacket(id, left, right) {
    if (socket) {
        socket.emit("audioPacket", {
            id: id,
            left: left,
            right: right
        });
    }
}

