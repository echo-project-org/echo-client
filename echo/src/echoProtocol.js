const at = require('./audioTransmitter');
const ar = require('./audioReceiver');

const io = require("socket.io-client");
var socket;
var ping = 0;

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

export function openConnection(id) {
    console.log("opening connection with socket")
    socket = io("ws://localhost:6982", { query: { id } });

    setInterval(() => {
        const start = Date.now();
      
        socket.emit("ping", () => {
            const duration = Date.now() - start;
            ping = duration;
        });
    }, 5000);
    
    // join the transmission on current room
    socket.emit("join", { id, roomId: 0 });

    socket.on("ready", (remoteId) => {
        console.log("opened", remoteId);
        ar.startOutputAudioStream(remoteId)
    });

    socket.on("receiveAudioPacket", (data) => {
        ar.addToBuffer(data.id, new Float32Array(data.left), new Float32Array(data.right));
    });

    socket.io.on("close", () => {
        console.log("connection closed");
        at.stopAudioStream();
    })
    
    socket.io.on("error", (error) => {
        console.log(error);
        alert("The audio server connection has errored out")
        at.stopAudioStream();
        socket.close();
    });

    // socket.io.on("ping", () => { console.log("pong") });
}

export function getPing() {
    return ping;
}

export function deafUser(id, value) {
    if (socket) socket.emit("deaf", { value, id });
}

export function closeConnection(id) {
    console.log("closing connection with socket")
    if (socket) socket.emit("end", id);
    // if we let client handle disconnection, then recursive happens cause of the event "close"
    // socket.close();
}

export function sendMessage(msg) {
    if (socket) {
        // socket.send("ECHO MSG" + msg);
    }
}

export function sendAudioPacket(id, left, right) {
    if (socket) {
        // console.log("sending pachet", id)
        socket.emit("audioPacket", {
            id: id,
            left: left,
            right: right
        });
    }
}

