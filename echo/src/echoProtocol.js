import audioRtcTransmitter from "./audioRtcTransmitter";

const io = require("socket.io-client");
var socket;
var ping = 0;
var pingInterval;
var at = null;

const SERVER_URL = "https://echo.kuricki.com"

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

function startReceiving(remoteId) {
    console.log("Starting input stream for", remoteId)
    at.subscribeToAudio(remoteId);
}

function stopReceiving(remoteId) {
    if (at) {
        at.unsubscribeFromAudio(remoteId);
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

export function toggleDeaf(deafstate) {
    if (at) {
        if (deafstate) {
            at.deaf();
        } else {
            at.undeaf();
        }
    }
}

export function setSpeakerDevice(deviceId) {
    at.setOutputDevice(deviceId);
}

export function setSpeakerVolume(volume) {
    at.setOutputVolume(volume);
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
    at.setPersonalVolume(volume, remoteId);
}

export function getSpeakerDevices() {
    return audioRtcTransmitter.getOutputAudioDevices();
}

export function getMicrophoneDevices() {
    return audioRtcTransmitter.getInputAudioDevices();
}

export function openConnection(id) {
    socket = io(SERVER_URL, {
        path: "/socket.io",
        query: { id }
    });
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
        console.error(error);
        alert("The audio server connection has errored out")
        stopTransmitting();
        stopReceiving();
        socket.close();
    });

    socket.on("server.userJoinedChannel", (data) => {
        console.log("user", data.id, "joined your channel, starting listening audio");
        startReceiving(data.id);
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
        if (at) {
            at.addCandidate(data.candidate);
        }
    });

    socket.on("server.renegotiationNeeded", (data, cb) => {
        if (at) {
            at.renegotiate(data.data.sdp, cb);
        }
    });
}

export function joinRoom(id, roomId) {
    console.log("joining event called", id, roomId)
    // join the transmission on current room
    socket.emit("client.join", { id, roomId });
    //startReceiving(1);
}

export function getPing() {
    return new Promise((resolve, reject) => {
        if (at) {
            at.getConnectionStats().then(stats => {
                resolve(stats.ping);
            });
        }
    });
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
    stopTransmitting();

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
            cb(description);
        });
    }
}

export function subscribeAudio(data, cb) {
    if (socket) {
        socket.emit("client.subscribeAudio", data, (description) => {
            cb(description);
        });
    }
}

export function unsubscribeAudio(data, cb) {
    if (socket) {
        socket.emit("client.unsubscribeAudio", data, (description) => {
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
