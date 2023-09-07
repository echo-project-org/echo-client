import audioRtcTransmitter from "./audioRtcTransmitter";
import audioRtcReceiver from "./audioRtcReceiver";

const io = require("socket.io-client");
var socket;
var ping = 0;
var pingInterval;
var at = null;
var incomingAudio = [];

const SERVER_URL = "ws://localhost:6982"

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
    incomingAudio = incomingAudio.filter(element => {
        if (element.senderId === remoteId) {
            element.close();
            return false;
        }

        return true;
    });

    let r = new audioRtcReceiver(id, remoteId);
    r.init();
    incomingAudio.push(r);
}

function stopReceiving(remoteId) {
    if (remoteId) {
        incomingAudio = incomingAudio.filter(element => {
            if (element.senderId === remoteId) {
                element.close();
                return false;
            }

            return true;
        });
    } else {
        incomingAudio.forEach(element => {
            element.close();
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

        socket.emit("client.ping", () => {
            const duration = Date.now() - start;
            ping = duration;
        });
    }, 5000);

    socket.on("server.ready", (remoteId) => {
        console.log("opened", remoteId);
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

    socket.on("server.userJoinedChannel", (data) => {
        console.log("user", data.id, "joined your channel, starting listening audio");
        startReceiving(id, data.id);
    });

    socket.on("server.sendAudioState", (data) => {
        console.log("got user audio info from server", data);
        if (!data.deaf || !data.mute) {
            //startReceiving();
        }
    });

    socket.on("server.userLeftChannel", (data) => {
        console.log("user", data.id, "left your channel, stopping listening audio");
        stopReceiving(data.id);
    });

    socket.on("server.iceCandidate", (data) => {
        console.log("got ice candidate from server", data);
        incomingAudio.forEach(element => {
            if (element.senderId === data.id) {
                element.addCandidate(data.data);
            }
        });
    });

    // socket.io.on("ping", () => { console.log("pong") });
}

export function joinRoom(id, roomId) {
    console.log("joining event called", id, roomId)
    // join the transmission on current room
    socket.emit("client.join", { id, roomId });
    //startReceiving(5, 5);
}

export function getPing() {
    return ping;
}

export function sendAudioState(id, data) {
    if (socket) socket.emit("client.audioState", { id, deaf: data.deaf, muted: data.muted });
}

export function exitFromRoom(id) {
    console.log("exit from room", id)
    stopReceiving();
    if (socket) socket.emit("client.exit", { id });
}

export function closeConnection(id = null) {
    if (socket) {
        if (!id) id = localStorage.getItem('id');
        console.log("closing connection with socket")
        socket.emit("client.end", { id });
    }

    stopReceiving();

    if (socket) {
        socket.close();
        socket = null;
    }
    clearInterval(pingInterval);
    // if we let client handle disconnection, then recursive happens cause of the event "close"
    // socket.close();
}

export function broadcastAudio(data, cb) {
    if (socket) {
        socket.emit("client.broadcastAudio", data, (description) => {
            console.log("---> Got description 'broadcastAudio' from socket")
            cb(description);
        });
    }
}

export function subscribeAudio(data, cb) {
    if (socket) {
        socket.emit("client.subscribeAudio", data, (description) => {
            console.log("---> Got description 'subscribeAudio' from socket")
            cb(description);
        });
    }
}

export function stopAudioBroadcast(data) {
    if (socket) {
        socket.emit("client.stopAudioBroadcast", data);
    }
}

export function sendIceCandidate(data) {
    if (socket) {
        socket.emit("client.iceCandidate", data);
    }
}
