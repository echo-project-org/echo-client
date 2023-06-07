class User {
    constructor(socket, id) {
        this.id = id;
        this.socket = socket;
        this.socketId = socket.id;
        this.lastRoom = 0;
        this.isDeaf = false;
        this.events = {};

        // this is dev, so TO BE REMOVED
        this.devLog = 0;

        this.socket.on("audioState", (data) => { this.triggerEvent("audioState", data) });
        this.socket.on("ping", (callback) => { callback(); });
        this.socket.on("join", (data) => this.triggerEvent("join", data));
        this.socket.on("end", (data) => this.triggerEvent("end", data));
        this.socket.on("sendChatMessage", (data) => this.triggerEvent("sendChatMessage", data));
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
        if (this.lastRoom !== 0) {
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
        this.lastRoom = 0;
        this.socket.disconnect();
    }

    // when current user join a room we start listening for packets
    join(data) {
        // I think i added another function call just in case i want to do something with the join event
        this.registerAudioListener(data);
    }

    registerAudioListener(data) {
        console.log("started audio listener for user", this.id)
        this.socket.on("audioPacket", (packet) => {
            this.triggerEvent("receiveAudioPacket", packet);
        });
    }

    // unused for now, could be handy in case of connection problems
    // (like reconnecting to the last room)
    setLastRoom(roomId) {
        if (typeof roomId !== "number") roomId = Number(roomId);
        if (isNaN(roomId)) return console.log("NOT A VALID ROOM NUMBER IN setLastRoom")
        this.lastRoom = roomId;
    }

    getLastRoom() {
        return this.lastRoom;
    }

    // send the chat message to the non-sender users
    receiveChatMessage(data) {
        this.socket.emit("receiveChatMessage", data);
    }
}

module.exports = User;