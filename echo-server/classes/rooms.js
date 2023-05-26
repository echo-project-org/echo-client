const User = require("./users");

const Colors = require("./colors");
const colors = new Colors();

class Rooms {
    constructor(io, socket) {
        this.emitter = io;
        this.rooms = new Map();
        this.connectedClients = new Map();
        this.socket;

        console.log(colors.changeColor("green", "Listening for new client connections"));

        this.enstablishConnection()
            .then((socket) => {
                this.socket = socket;
                this.registerRoomEvents();
            })
    }

    enstablishConnection() {
        return new Promise((resolve, reject) => {
            this.emitter.on('connection', (socket) => {
                const request = socket.request;
                // console.log(request._query)
                const id = request._query["id"];
                if (!id) return reject("no-id-in-query");
    
                const newUser = new User(socket, id);
                this.connectedClients.set(id, newUser);
                console.log(colors.changeColor("yellow", "New socket connection from client " + id));
                resolve(socket);
            });
        });
    }

    registerRoomEvents() {
        this.joinRoom.bind(this);
        this.socket.on("join", (data) => this.joinRoom(data));
        this.socket.on("end", (id) => this.end(id));
    }

    joinRoom({ userId, roomId }) {
        if (!this.rooms.has(roomId)) this.addRoom(roomId);
        if (this.connectedClients.has(userId)) this.addUserToRoom(userId, roomId);
        else console.log(colors.changeColor("red", "Can't add user " + userId + " to room " + roomId + ", user is not connected to socket"));
    }

    end(id) {
        // if ()
    }

    addRoom(id) {
        this.rooms.set(id, {
            id,
            private: false,
            users: new Map(),
            password: null,
            display: "New room"
        })
    }

    addUserToRoom(userId, roomId) {
        if (this.rooms.has(roomId)) {
            const user = this.connectedClients.get(userId);
            user.setLastRoom(roomId);
            this.rooms.get(roomId).users.set(user.id, user);
        }
    }

    getUsersInRoom(id) {
        if (this.rooms.has(id)) return this.rooms.get(id).users;
    }
}

module.exports = Rooms;