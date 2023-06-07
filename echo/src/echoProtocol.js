const at = require('./audioTransmitter');
const ar = require('./audioReceiver');

const io = require("socket.io-client");
var socket;
var ping = 0;
var pingInterval;

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

    pingInterval = setInterval(() => {
        const start = Date.now();
      
        socket.emit("ping", () => {
            const duration = Date.now() - start;
            ping = duration;
        });
    }, 5000);

    socket.on("ready", (remoteId) => {
        console.log("opened", remoteId);
        ar.startOutputAudioStream(remoteId)
    });

    socket.on("receiveAudioPacket", (data) => {
        // console.log("got pack from", data.id)
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

    socket.on("userJoinedChannel", (data) => {
        console.log("user", data, "joined your channel, starting listening audio");
        ar.startOutputAudioStream(data.id)
    });

    socket.on("sendAudioState", (data) => {
        console.log("got user audio info from server", data);
        if(!data.deaf || !data.mute)
            ar.startOutputAudioStream(data.id)
    })

    // socket.io.on("ping", () => { console.log("pong") });
}

export function joinRoom(id, roomId) {
    console.log("joining event called", id, roomId)
    // join the transmission on current room
    socket.emit("join", { id, roomId, cb: () => {
        console.log("response from join, i'm in channel")
    }});
}

export function getPing() {
    return ping;
}

export function sendAudioState(id, data) {
    if (socket) socket.emit("audioState", { id, deaf: data.deaf, muted: data.muted });
}

export function closeConnection(id) {
    if (socket) {
        console.log("closing connection with socket")
        socket.emit("end", { id });
    }
    socket = null;
    clearInterval(pingInterval);
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

