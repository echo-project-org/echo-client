class User {
    constructor(socket, id) {
        this.id = id;
        this.socket = socket;
        this.socketId = socket.id;
        this.lastRoom = 0;
        this.isDeaf = false;
        this.events = {};

        this.socket.on("deaf", (id) => { this.deaf(id); });
        this.socket.on("ping", (callback) => { callback(); });
        this.socket.on("join", (data) => this.triggerEvent("join", data));
        this.socket.on("end", (data) => this.triggerEvent("end", data));
    }

    registerEvent(event, cb) {
        console.log("event", event, "registered")
        if (!this.events[event]) this.events[event] = {};
        this.events[event].cb = cb;
    }

    triggerEvent(event, data) {
        if (this.events[event]) this.events[event].cb(data);
        else console.log("can't trigger event", event, "NOT FOUND")
    }

    deaf(id) {
        console.log("deaf request from", id)
    }

    end(id) {
        this.socket.disconnect();
    }

    join(data) {
        this.registerAudioListener();
    }

    registerAudioListener(cb) {
        console.log("started audio listener for user", this.id)
        this.socket.on("audioPacket", (packet) => {
            // console.log("got pack", this.socket.id, packet.id);
            // console.log("got pack")
            // console.log(packet);
            this.remoteUsers.forEach((user, id) => {
                // console.log(id, userId);
                // console.log("sending audio to", id, "from", this.id);
                this.socket.emit("receiveAudioPacket", packet);
            });
        });
    }

    setLastRoom(roomId) {
        if (typeof roomId !== "number") roomId = Number(roomId);
        if (isNaN(roomId)) return console.log("NOT A VALID ROOM NUMBER IN setLastRoom")
        this.lastRoom = roomId;
    }
}

module.exports = User;