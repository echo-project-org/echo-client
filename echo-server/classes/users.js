class User {
    constructor(socket, id) {
        this.id = id;
        this.socket = socket;
        this.socketId = socket.id;
        this.currentRoom = 0;
        this.isDeaf = false;
        this.isMuted = false;
        this.events = {};

        this.isJoined = false;
        // define rtc
        this.rtc = null;

        // this is dev, so TO BE REMOVED
        this.devLog = 0;

        this.socket.on("audioState", (data) => { this.triggerEvent("audioState", data) });
        this.socket.on("ping", (callback) => { callback(); });
        this.socket.on("join", (data) => this.triggerEvent("join", data));
        this.socket.on("end", (data) => this.triggerEvent("end", data));
        this.socket.on("sendChatMessage", (data) => this.triggerEvent("sendChatMessage", data));
        this.socket.on("exit", (data) => this.triggerEvent("exit", data));
        // first call when user join application ("hey i'm here, i'm sending audio packets")
        this.socket.on("broadcastAudio", (data, cb) => this.broadcastAudio(data, cb));
        // when user join a room, we send the connected user streams to the new user ("hey, send me the requested stream")
        this.socket.on("subscribeAudio", (data, cb) => this.subscribeAudio(data, cb));
        this.socket.on("stopAudioBroadcast", (data) => this.stopAudioBroadcast(data));
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
            this.socket.emit("userJoinedChannel", { id: id })
        }
    }

    sendAudioPacket(data) {
        // this is dev, so TO BE REMOVED
        if (this.devLog === 100) {
            console.log("sending audio to", data.id, "from", this.id);
            this.devLog = 0;
        }
        this.devLog++;
        // --------------------- //
        this.socket.emit("receiveAudioPacket", { id: data.id, left: data.left, right: data.right });
    }

    // send the audio state of the sender user to the non-sender users
    sendAudioState(data) {
        this.socket.emit("sendAudioState", data);
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
        // I think i added another function call just in case i want to do something with the join event
        this.registerAudioListener(data);
        // need to add this cause i'm creating a socket listener every time someone join a room (not good :P)
        this.isJoined = true;
        // set last room to current room just in case
        this.currentRoom = data.roomId;
    }

    // does this make sens??? i don't know, but it's here so.... :P
    registerAudioListener(data) {
        if (this.isJoined) return;
        console.log("started audio listener for user", this.id)
        this.socket.on("audioPacket", (packet) => {
            if (this.devLog === 100) {
                console.log("got audio from", this.id, packet, this.currentRoom);
                this.devLog = 0;
            }
            this.devLog++;
            this.triggerEvent("receiveAudioPacket", packet);
        });
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
            this.socket.emit("userLeftChannel", { id: id })
        }
    }

    getCurrentRoom() {
        return this.currentRoom;
    }

    // send the chat message to the non-sender users
    receiveChatMessage(data) {
        this.socket.emit("receiveChatMessage", data);
    }

    // set the user's rtc definition
    setRtc(rtc) {
        this.rtc = rtc;
    }

    async broadcastAudio(data, cb) {
        if (this.rtc) {
            const resp = await this.rtc.broadcastAudio(data);
            switch (resp) {
                case "NO-ID":
                    console.log("NO-ID");
                    break;
                default:
                    cb(resp);
                    break;
            }
        }
    }

    async subscribeAudio(data, cb) {
        if (this.rtc) {
            const resp = await this.rtc.subscribeAudio(data);
            switch (resp) {
                case "NO-SENDER-ID":
                    console.log("NO-SENDER-ID");
                    break;
                case "NO-RECEIVER-ID":
                    console.log("NO-RECEIVER-ID");
                    break;
                case "NO-SENDER-CONNECTION":
                    console.log("NO-SENDER-CONNECTION");
                    break;
                default:
                    cb(resp);
                    break;
            }
        }
    }

    stopAudioBroadcast(data) {
        if (this.rtc)
            this.rtc.stopAudioBroadcast(data);
    }
}

module.exports = User;