class User {
    constructor(id, socket, io) {
        console.log("new user with id", id);
        this.userId = id;
        this.socket = socket;
        this.emitter = io;

        this.events();
    }

    events() {
        this.socket.on("audioPacket", (packet) => {
            console.log("got pack")
            console.log(packet);

            this.emitter.emit("receiveAudioPacket", packet);
        });
    }


}

module.exports = User;