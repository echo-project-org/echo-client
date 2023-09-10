class User {
    constructor(socket, id) {
        this.id = id;
        this.socket = socket;
        this.socketId = socket.id;
        this.currentRoom = 0;
        this.isDeaf = false;
        this.isMuted = false;
        this.events = {};

        // define rtc
        this.rtc = null;
        this.videoRtc = null;

        // room stuff
        this.socket.on("client.audioState", (data) => { this.triggerEvent("audioState", data) });
        this.socket.on("client.ping", (callback) => { callback(); });
        this.socket.on("client.join", (data) => this.triggerEvent("join", data));
        this.socket.on("client.end", (data) => this.triggerEvent("end", data));
        this.socket.on("client.sendChatMessage", (data) => this.triggerEvent("sendChatMessage", data));
        this.socket.on("client.exit", (data) => this.triggerEvent("exit", data));
        // audioRtc stuff
        this.socket.on("client.broadcastAudio", (data, cb) => this.broadcastAudio(data, cb));
        this.socket.on("client.subscribeAudio", (data, cb) => this.subscribeAudio(data, cb));
        this.socket.on("client.stopAudioBroadcast", (data) => this.stopAudioBroadcast(data));
        this.socket.on("client.unsubscribeAudio", (data) => this.unsubscribeAudio(data));
        this.socket.on("client.iceCandidate", (data) => this.setIceCandidate(data));

        // videoRtc stuff
        this.socket.on("client.negotiateVideoRtc", (data, cb) => this.negotiateVideoRtc(data, cb));
        this.socket.on("client.subscribeVideo", (data, cb) => this.subscribeVideo(data, cb));
        this.socket.on("client.stopVideoBroadcast", (data) => this.stopVideoBroadcast(data));
        this.socket.on("client.unsubscribeVideo", (data) => this.unsubscribeVideo(data));
        this.socket.on("client.videoIceCandidate", (data) => this.setVideoIceCandidate(data));
    }

    registerEvent(event, cb) {
        console.log("event", event, "registered")
        if (!this.events[event]) this.events[event] = {};
        this.events[event].cb = cb;
    }

    triggerEvent(event, data) {
        // register event and save the reference function to be called
        if (this.events[event]) this.events[event].cb(data)
        else console.log("can't trigger event", event, "NOT FOUND", this.id);
        // call same function if it exists
        if (this[event]) this[event](data);
    }

    /**
     * Section dedicated to send socket messages to non-sender clients
     */

    // called when remote user join the current room
    userJoinedCurrentChannel(id) {
        if (this.currentRoom !== 0) {
            this.socket.emit("server.userJoinedChannel", { id: id })
        }
    }

    // send the audio state of the sender user to the non-sender users
    sendAudioState(data) {
        this.socket.emit("server.sendAudioState", data);
    }

    // update the audio state of the current user
    audioState(data) {
        console.log("deaf request from", data)
        this.isDeaf = data.deaf;
        this.isMuted = data.muted;
    }

    // you know what this does
    end(id) {
        this.currentRoom = 0;
        this.socket.disconnect();
    }

    // when user exit the channel
    exit(data) {
        this.currentRoom = 0;
    }

    // when current user join a room we start listening for packets
    join(data) {
        // set last room to current room just in case
        this.currentRoom = data.roomId;
    }

    // unused for now, could be handy in case of connection problems
    // (like reconnecting to the last room)
    setCurrentRoom(roomId) {
        if (typeof roomId !== "number") roomId = Number(roomId);
        if (isNaN(roomId)) return console.log("NOT A VALID ROOM NUMBER IN setCurrentRoom")
        this.currentRoom = roomId;
    }

    userLeftCurrentChannel(id) {
        if (this.currentRoom !== 0) {
            this.socket.emit("server.userLeftChannel", { id: id })
        }
    }

    getCurrentRoom() {
        return this.currentRoom;
    }

    // send the chat message to the non-sender users
    receiveChatMessage(data) {
        this.socket.emit("server.receiveChatMessage", data);
    }

    // set the user's rtc definition
    setRtc(rtc) {
        this.rtc = rtc;
    }

    setVideoRtc(rtc) {
        this.videoRtc = rtc;
    }

    broadcastAudio(data, cb) {
        if (this.rtc) {
            this.rtc.broadcastAudio(data, this)
                .then((resp) => {
                    cb(resp);
                })
                .catch((err) => {
                    console.log("broadcastAudio error", err);
                });
        }
    }

    subscribeAudio(data, cb) {
        if (this.rtc) {
            console.log("User ", data.senderId, "requested audio subscription to user", data.receiverId);
            data.socket = this.socket;
            this.rtc.subscribeAudio(data, this)
                .then((resp) => {
                    cb(resp);
                })
                .catch((err) => {
                    console.log("subscribeAudio error", err);
                });
        }
    }

    stopAudioBroadcast(data) {
        if (this.rtc) {
            const resp = this.rtc.stopAudioBroadcast(data);
            switch (resp) {
                case "NO-ID":
                    console.log("NO-ID");
                    break;
                default:
                    break;
            }
        }
    }

    unsubscribeAudio(data) {
        if (this.rtc) {
            const resp = this.rtc.unsubscribeAudio(data);
            switch (resp) {
                case "NO-SENDER-ID":
                    console.log("NO-SENDER-ID");
                    break;
                case "NO-RECEIVER-ID":
                    console.log("NO-RECEIVER-ID");
                    break;
                default:
                    break;
            }
        }
    }

    iceCandidate(candidate) {
        this.socket.emit("server.iceCandidate", { data: candidate });
    }

    setIceCandidate(data) {
        if (this.rtc) {
            this.rtc.addCandidate(data);
        }
    }

    renegotiationNeeded(offer, cb) {
        this.socket.emit("server.renegotiationNeeded", { data: offer }, (description) => {
            console.log("Got renegotiation answer from client");
            cb(description)
        });
    }

    // video stuff
    negotiateVideoRtc(data, cb) {
        if (this.videoRtc) {
            this.videoRtc.broadcastVideo(data, this)
                .then((resp) => {
                    cb(resp);
                })
                .catch((err) => {
                    console.log("broadcastVideo error", err);
                });
        }
    }

    subscribeVideo(data, cb) {
        if (this.videoRtc) {
            console.log("User ", data.senderId, "requested video subscription to user", data.receiverId);
            data.socket = this.socket;
            this.videoRtc.subscribeVideo(data, this)
                .then((resp) => {
                    cb(resp);
                })
                .catch((err) => {
                    console.log("subscribeVideo error", err);
                });
        }
    }

    stopVideoBroadcast(data) {
        if (this.videoRtc) {
            const resp = this.videoRtc.stopVideoBroadcast(data);
            switch (resp) {
                case "NO-ID":
                    console.log("NO-ID");
                    break;
                default:
                    break;
            }
        }
    }

    unsubscribeVideo(data) {
        if (this.videoRtc) {
            const resp = this.videoRtc.unsubscribeVideo(data);
            switch (resp) {
                case "NO-SENDER-ID":
                    console.log("NO-SENDER-ID");
                    break;
                case "NO-RECEIVER-ID":
                    console.log("NO-RECEIVER-ID");
                    break;
                default:
                    break;
            }
        }
    }

    videoIceCandidate(candidate) {
        this.socket.emit("server.videoIceCandidate", { data: candidate });
    }

    setVideoIceCandidate(data) {
        if (this.videoRtc) {
            this.videoRtc.addCandidate(data);
        }
    }

    videoRenegotiationNeeded(offer, cb) {
        this.socket.emit("server.videoRenegotiationNeeded", { data: offer }, (description) => {
            console.log("Got video renegotiation answer from client");
            cb(description)
        });
    }
}

module.exports = User;