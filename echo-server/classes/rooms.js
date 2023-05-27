const User = require("./users");
const Chat = require("./chat");

const Colors = require("./colors");
const colors = new Colors();

class Rooms {
    constructor(io, socket) {
        this.emitter = io;
        this.rooms = new Map();
        this.connectedClients = new Map();
        this.userListeners = new Map();
        this.socket = null;

        console.log(colors.changeColor("green", "Listening for new client connections"));
        
        this.emitter.on('connection', (socket) => {
            const request = socket.request;
            // console.log(request._query)
            const id = request._query["id"];
            if (!id) return reject("no-id-in-query");

            const newUser = new User(socket, id);
            this.connectedClients.set(id, newUser);
            console.log(colors.changeColor("yellow", "New socket connection from client " + id));
            this.registerClientEvents(newUser);
        });
    }

    registerClientEvents(user) {
        console.log("registering events for", user.id);
        user.registerEvent("receiveAudioPacket", (data) => {
            this.sendAudioToConnectedClients(data);
        });
        user.registerEvent("join", (data) => {
            this.joinRoom(data);
        });
        user.registerEvent("end", (data) => {
            this.endConnection(data);
        });
    }

    sendAudioToConnectedClients(data) {
        const roomId = this.connectedClients.get(data.id).getLastRoom();
        if (this.rooms.has(roomId)) {
            const users = this.rooms.get(roomId).users;
            users.forEach((user, id) => {
                if (id !== data.id && !user.isDeaf)
                    user.sendAudioPacket(data);
            })
        }
    }

    joinRoom(data) {
        console.log("got join message", data)
        data.userId = data.id;
        this.addRoom(data.roomId);
        this.addUserToRoom(data.userId, data.roomId);
    }

    endConnection(data) {
        console.log("ending", data.id)
        this.removeUserFromRooms(data.id);
        this.connectedClients.delete(data.id);
    }

    addRoom(id) {
        if (!this.rooms.has(id)) {
            console.log("creating room", id)
            this.rooms.set(id, {
                id,
                private: false,
                users: new Map(),
                password: null,
                display: "New room",
                chat: new Chat(id)
            });
        }
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
        }
    }

    addUserToRoom(userId, roomId) {
        if (this.connectedClients.has(userId)) {
            if (this.rooms.has(roomId)) {
                const user = this.connectedClients.get(userId);
                user.setLastRoom(roomId);
                this.rooms.get(roomId).users.set(user.id, user);
            }
        } else console.log(colors.changeColor("red", "Can't add user " + userId + " to room " + roomId + ", user is not connected to socket"));
    }

    getUsersInRoom(id) {
        if (this.rooms.has(id)) return this.rooms.get(id).users;
    }
}

module.exports = Rooms;