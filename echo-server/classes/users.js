class User {
    constructor(socket, id) {
        this.id = id;
        this.socket = socket;
        this.socketId = socket.id;
        this.lastRoom = 0;
        this.isDeaf = false;
        this.events = {};

        this.devLog = 0;

        this.socket.on("audioState", (data) => { this.triggerEvent("audioState", data) });
        this.socket.on("ping", (callback) => { callback(); });
        this.socket.on("join", (data) => this.triggerEvent("join", data));
        this.socket.on("end", (data) => this.triggerEvent("end", data));
        // this.socket.on("userJoinedRoom", (data) => this.triggerEvent("userJoinedRoom", data));
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

    // called when remote user join the current room
    userJoinedCurrentChannel(id) {
        if (this.lastRoom !== 0) {
            this.socket.emit("userJoinedChannel", { id: id })
        }
    }

    sendAudioPacket(data) {
        if (this.devLog === 100) {
            console.log("sending audio to", data.id, "from", this.id);
            this.devLog = 0;
        }
        this.devLog++;
        this.socket.emit("receiveAudioPacket", { id: data.id, left: data.left, right: data.right });
    }

    sendAudioState(data) {
        this.socket.emit("sendAudioState", data);
    }

    audioState(data) {
        console.log("deaf request from", data)
        this.isDeaf = data.deaf;
        this.isMuted = data.muted;
    }

    end(id) {
        this.lastRoom = 0;
        this.socket.disconnect();
    }

    // when current user join a room we start listening for packets
    join(data) {
        this.registerAudioListener(data);
    }

    registerAudioListener(data) {
        console.log("started audio listener for user", this.id)
        this.socket.on("audioPacket", (packet) => {
            this.triggerEvent("receiveAudioPacket", packet);
        });
    }

    setLastRoom(roomId) {
        if (typeof roomId !== "number") roomId = Number(roomId);
        if (isNaN(roomId)) return console.log("NOT A VALID ROOM NUMBER IN setLastRoom")
        this.lastRoom = roomId;
    }

    getLastRoom() {
        return this.lastRoom;
    }
}

module.exports = User;