class Users 
    constructor(socket) {
        this.socket = socket;
        this.socketId = socket.id;
        console.log("new user, socketid", this.socketId);

        this.users = new Map();
        this.rooms = new Map();

        // dev only
        this.rooms.set(0, { users: this.users });

        this.socket.on("join", (data) => {
            console.log("new user", data);
            this.socket.send("ready");
            this.users.set(data.id, new User(socket));
            // join user in room
            this.rooms.set(data.roomId, data.id);
        });
    }

    sendAudioInRoom(roomId = 0, userId = 0, packet) {
        const room = this.rooms.get(roomId);
        if (room) {
            // console.log("this.users", packet);
            this.users.forEach((user, id) => {
                if (id !== userId) {
                    console.log("sending audio to", id)
                    this.socket.send("receiveAudioPacket", packet);
                }
            });
        }
    }
}

class User extends Users {
    constructor(socket, id) {
        super(socket);
        this.id = id;
        this.socket = socket;
        this.events();
    }

    events() {
        this.socket.on("audioPacket", (packet) => {
            console.log("got pack", this.socket.id, packet.id);
            // console.log("got pack")
            // console.log(packet);

            this.sendAudioInRoom(undefined, packet.id, packet);
        });

        this.socket.on("end", (id) => {
            this.socket.disconnect();
            console.log("requesting end ws with", id, this.socketId);
        })
    }
}

module.exports = User;