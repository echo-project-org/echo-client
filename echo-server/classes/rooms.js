const User = require("./users");
const Chat = require("./chat");

const Colors = require("./colors");
const colors = new Colors();

class Rooms {
    constructor(io, socket) {
        this.emitter = io;
        this.rooms = new Map();
        this.connectedClients = new Map();
        this.socket = null;

        console.log(colors.changeColor("green", "Listening for new client connections"));

        this.enstablishConnection()
            .then((socket) => {
                // socket.reconnects = false;
                this.registerRoomEvents(socket);
            })
            .catch(console.error);
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

    registerRoomEvents(socket) {
        this.socket = socket;
        this.socket.on("join", (data) => this.joinRoom(data));
        this.socket.on("end", (id) => this.end(id));
    }

    joinRoom(data) {
        console.log("got join message", data)
        data.userId = data.id;
        if (!this.rooms.has(data.roomId)) this.addRoom(data.roomId);
        if (this.connectedClients.has(data.userId)) this.addUserToRoom(data.userId, data.roomId);
        else console.log(colors.changeColor("red", "Can't add user " + data.userId + " to room " + data.roomId + ", user is not connected to socket"));
    }

    end(userId) {
        console.log("ending", userId)
        this.removeUserFromRooms(userId);
        // if ()
    }

    addRoom(id) {
        this.rooms.set(id, {
            id,
            private: false,
            users: new Map(),
            password: null,
            display: "New room",
            chat: new Chat(id)
        })
    }

    removeUserFromRooms(userId) {
        if (this.connectedClients.has(userId)) {
            this.rooms.forEach((room, id, arr) => {
                if (room.users.has(userId)) {
                    console.log("removing userId", userId, "from room", id);
                    room.users.delete(userId);
                    // breaks the foreach to save resources??? maybe idk...
                    arr.length = id + 1;
                }
            });
            this.connectedClients.delete(userId);
        }
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