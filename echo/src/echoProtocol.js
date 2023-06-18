import audioRtcTransmitter from "./audioRtcTransmitter";
import audioRtcReceiver from "./audioRtcReceiver";

const io = require("socket.io-client");
var socket;
var ping = 0;
var pingInterval;
var at = null;
var incomingAudio = [];

const SERVER_URL = "ws://kury.ddns.net:6982"

async function startTransmitting(id = 5) {
    if (at) {
        stopTransmitting();
    }
    at = new audioRtcTransmitter(id);
    await at.init();
}

function stopTransmitting() {
    if (at) {
        at.close();
        at = null;
    }
}

function startReceiving(id = 5, remoteId = 5) {
    console.log(id, remoteId)
    let a = false;
    incomingAudio.forEach(element => {
        console.log(typeof element.id, typeof id)
        console.log(element.id, id)
        if (element.id === id) {
            element.close();
            element = new audioRtcReceiver(id, remoteId);
            element.init();
            a = true;
        }
    });

    if (a) {
        return;
    }

    let r = new audioRtcReceiver(id, remoteId);
    r.init();
    incomingAudio.push(r);
}

function stopReceiving(remoteId) {
    if (remoteId) {
        incomingAudio.forEach(element => {
            console.log(element.senderId, remoteId)
            if (element.senderId === remoteId) {
                element.close();
                element = null;
                return;
            }
        });
    } else {
        incomingAudio.forEach(element => {
            element.close();
            element = null;
        });

        incomingAudio = [];
    }
}

export function toggleMute(mutestate) {
    if (at) {
        if (mutestate) {
            at.mute();
        } else {
            at.unmute();
        }
    }
}

export function setSpeakerDevice(deviceId) {
    incomingAudio.forEach(element => {
        element.setDevice(deviceId);
    });
}

export function setSpeakerVolume(volume) {

}

export function setMicrophoneDevice(deviceId) {
    if (at) {
        at.close();
        at = new audioRtcTransmitter(deviceId);
    }
}

export function setMicrophoneVolume(volume) {
    if (at) {
        at.setVolume(volume);
    }
}

export function setUserVolume(volume, remoteId) {
    incomingAudio.forEach(element => {
        if (element.senderId === remoteId) {
            element.setVolume(volume);
            return;
        }
    });
}

export function getSpeakerDevices() {
    return audioRtcReceiver.getAudioDevices();
}

export function getMicrophoneDevices() {
    return audioRtcTransmitter.getAudioDevices();
}

export function openConnection(id) {
    console.log("opening connection with socket")
    socket = io(SERVER_URL, { query: { id } });
    startTransmitting(id);

    pingInterval = setInterval(() => {
        const start = Date.now();

        socket.emit("ping", () => {
            const duration = Date.now() - start;
            ping = duration;
        });
    }, 5000);

    socket.on("ready", (remoteId) => {
        console.log("opened", remoteId);
    });

    socket.on("receiveAudioPacket", (data) => {
        // console.log("got pack from", data.id)
        //ar.addToBuffer(data.id, new Float32Array(data.left), new Float32Array(data.right));
    });

    socket.io.on("close", () => {
        console.log("connection closed");
        stopTransmitting();
        stopReceiving();
    })

    socket.io.on("error", (error) => {
        console.log(error);
        alert("The audio server connection has errored out")
        stopTransmitting();
        stopReceiving();
        socket.close();
    });

    socket.on("userJoinedChannel", (data) => {
        console.log("user", data.id, "joined your channel, starting listening audio");
        startReceiving(id, data.id);
    });

    socket.on("sendAudioState", (data) => {
        console.log("got user audio info from server", data);
        if (!data.deaf || !data.mute) {
            //startReceiving();
        }
    });

    socket.on("userLeftChannel", (data) => {
        console.log("user", data.id, "left your channel, stopping listening audio");
        stopReceiving(data.id);
    });

    // socket.io.on("ping", () => { console.log("pong") });
}

export function joinRoom(id, roomId) {
    console.log("joining event called", id, roomId)
    // join the transmission on current room
    socket.emit("join", {
        id, roomId, cb: () => {
            console.log("response from join, i'm in channel")
        }
    });
    //startReceiving(5, 5);
}

export function getPing() {
    return ping;
}

export function sendAudioState(id, data) {
    if (socket) socket.emit("audioState", { id, deaf: data.deaf, muted: data.muted });
}

export function exitFromRoom(id) {
    console.log("exit from room", id)
    stopReceiving();
    if (socket) socket.emit("exit", { id });
}

export function closeConnection(id = null) {
    if (socket) {
        if (!id) id = localStorage.getItem('id');
        console.log("closing connection with socket")
        socket.emit("end", { id });
    }

    stopReceiving();

    socket.close();
    socket = null;
    clearInterval(pingInterval);
    // if we let client handle disconnection, then recursive happens cause of the event "close"
    // socket.close();
}

export function broadcastAudio(data, cb) {
    if (socket) {
        socket.emit("broadcastAudio", data, (description) => {
            console.log("---> Got description 'broadcastAudio' from socket")
            cb(description);
        });
    }
}

export function subscribeAudio(data, cb) {
    if (socket) {
        socket.emit("subscribeAudio", data, (description) => {
            console.log("---> Got description 'subscribeAudio' from socket")
            cb(description);
        });
    }
}