class User {
    constructor(socket, id) {
        this.id = id;
        this.socket = socket;
        this.socketId = socket.id;
        console.log("new user, socketid", this.socketId);

        this.remoteUsers = new Map();

        this.socket.on("join", (data) => { this.join(data) });
        this.socket.on("end", (id) => { this.end(id) });
        this.socket.on("mute", (id) => { this.mute(id); })
    }

    mute(id) {
        
    }

    end(id) {
        console.log("requesting end ws with", id, this.socketId);
        this.socket.disconnect();
    }

    join(data) {
        console.log("new user", data);

        this.registerAudioListener();
    }

    addRemoteUser(remoteUser) {
        console.log("adding remote user", remoteUser.id, "to", this.id);
        this.remoteUsers.set(remoteUser.id, remoteUser);
        this.socket.emit("ready", remoteUser.id);
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
}

module.exports = User;