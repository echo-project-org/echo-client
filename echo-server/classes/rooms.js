const User = require("./users");
const VideoRTC = require("./videoRtc");
const mediasoup = require("mediasoup");
const Colors = require("./colors");
const colors = new Colors();

const audioCodec = {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2
}

class Rooms {
    constructor(io, socket) {
        this.emitter = io;
        this.rooms = new Map();
        this.connectedClients = new Map();
        this.userListeners = new Map();
        this.socket = null;
        this.worker = null;

        //const rtc = new ServerRTC();
        //const videoRtc = new VideoRTC();

        console.log(colors.changeColor("green", "Listening for new client connections"));

        mediasoup.createWorker ({
            logLevel: 'warn',
            logTags: [
                'info',
                'ice',
                'dtls',
                'rtp',
                'srtp',
                'rtcp',
                'rtx',
                'bwe',
                'score',
                'simulcast',
                'svc',
                'sctp'
            ],
            rtcMinPort: 40000,
            rtcMaxPort: 49999
        }).then((worker) => {
            this.worker = worker;
            console.log(colors.changeColor("cyan", "Mediasoup worker created with pid " + this.worker.pid));

            this.worker.on('died', (e) => {
                console.log(colors.changeColor("red", "Mediasoup worker died\n" + e));
            });

            this.worker.observer.on('close', () => {
                console.log(colors.changeColor("red", "Mediasoup worker closed"));
            });

            this.worker.observer.on('newrouter', (router) => {
                console.log(colors.changeColor("cyan", "Mediasoup router created with id " + router.id));
            });
        });


        this.emitter.on('connection', (socket) => {
            const request = socket.request;
            // console.log(request._query)
            const id = request._query["id"];
            if (!id) return reject("no-id-in-query");

            const newUser = new User(socket, id);
            //newUser.setRtc(rtc);
            //newUser.setVideoRtc(videoRtc);
            this.connectedClients.set(id, newUser);
            console.log(colors.changeColor("yellow", "New socket connection from client " + id));
            this.registerClientEvents(newUser);
        });
    }

    registerClientEvents(user) {
        console.log("registering events for", user.id);
        user.registerEvent("join", (data) => {
            this.joinRoom(data);
        });
        user.registerEvent("end", (data) => {
            this.endConnection(data);
            user.rtc.clearUserConnection(data);
        });
        user.registerEvent("audioState", (data) => {
            this.sendAudioState(data);
        });
        user.registerEvent("sendChatMessage", (data) => {
            this.sendChatMessage(data);
        });
        user.registerEvent("exit", (data) => {
            this.exitRoom(data);
        });
        user.registerEvent("updateUser", (data) => {
            this.updateUser(data);
        });
        user.registerEvent("videoBroadcastStarted", (data) => {
            this.videoBroadcastStarted(data);
        });
        user.registerEvent("videoBroadcastStop", (data) => {
            this.videoBroadcastStop(data);
        });
    }

    updateUser(data) {
        if (this.connectedClients.has(data.id)) {
            this.connectedClients.forEach((user, _) => {
                if (data.id !== user.id) {
                    user.userUpdated(data);
                }
            });
        }
    }

    videoBroadcastStarted(data) {
        if (this.connectedClients.has(data.id)) {
            this.connectedClients.forEach((user, _) => {
                user.videoBroadcastStarted(data);
            });
        }
    }

    videoBroadcastStop(data) {
        if (this.connectedClients.has(data.id)) {
            this.connectedClients.forEach((user, _) => {
                user.videoBroadcastStop(data);
            });
        }
    }

    sendChatMessage(data) {
        console.log("got sendChatMessage event from user", data)
        if (this.connectedClients.has(data.id)) {
            data.roomId = Number(data.roomId);
            const room = this.rooms.get(data.roomId);
            if (room) {
                room.users.forEach((user, id) => {
                    console.log("sending message to connected clients in room", user.id)
                    user.receiveChatMessage(data);
                });
            }
        }
    }

    sendAudioState(data) {
        if (this.connectedClients.has(data.id)) {
            const user = this.connectedClients.forEach((user, id) => {
                if (String(id) !== String(data.id))
                    user.sendAudioState(data);
            });
        }
    }

    joinRoom(data) {
        console.log("got join message", data)
        this.addRoom(data.roomId);
        this.addUserToRoom(data);
    }

    endConnection(data) {
        console.log("ending", data.id)
        this.removeUserFromRooms(data.id);
        this.connectedClients.forEach((user, _) => {
            if (data.id !== user.id) {
                console.log("Notifing", user.id, "about", data.id)
                user.endConnection(data);
            }
        });
        this.connectedClients.delete(data.id);
    }

    addRoom(id) {
        if (!this.rooms.has(id)) {
            console.log("creating room", id, typeof id)

            let r = this.worker.createRouter({ options: [audioCodec], appData: { roomId: id } });
            this.rooms.set(id, {
                id,
                private: false,
                users: new Map(),
                password: null,
                display: "New room",
                mediasoupRouter: r
            });
        }
    }

    removeUserFromRooms(id) {
        if (this.connectedClients.has(id)) {
            this.rooms.forEach((room, _, arr) => {
                console.log("checking room", room.id, "for user", id)
                if (room.users.has(id)) {
                    console.log("removing id", id, "from room", room.id);
                    room.users.delete(id);
                }
            });
        }
    }

    exitRoom(data) {
        console.log("exiting room", data.id)
        if (this.connectedClients.has(data.id)) {
            const user = this.connectedClients.get(data.id);
            const roomId = user.getCurrentRoom();
            if (this.rooms.has(roomId)) {
                console.log("deleted user", data.id, "from room", roomId)

                this.connectedClients.forEach((user, _) => {
                    if (data.id !== user.id) {
                        console.log("Notifing", user.id, "about", data.id)
                        const userRoom = user.getCurrentRoom();
                        const isConnected = userRoom === roomId;
                        user.userLeftCurrentChannel({ id: data.id, roomId: roomId, isConnected });
                    }
                })
                const room = this.rooms.get(roomId);
                room.users.delete(data.id);
            }
        }
    }

    /**
     * 
     * @param {*} id User joining the room
     * @param {*} roomId 
     */
    addUserToRoom(data) {
        const id = data.id;
        const roomId = data.roomId;
        if (this.connectedClients.has(id)) {
            if (this.rooms.has(roomId)) {
                const user = this.connectedClients.get(id);
                user.setCurrentRoom(roomId);
                this.rooms.get(roomId).users.set(user.id, user);

                //Notify all users
                this.connectedClients.forEach((user, _) => {
                    if (id !== user.id) {
                        console.log("Notifing", user.id, "about", id)
                        const userRoom = user.getCurrentRoom();
                        data.isConnected = userRoom === roomId;
                        user.userJoinedChannel(data);
                    }
                })

                //Notify the user about all other users
                let newUser = this.connectedClients.get(id);
                this.getUsersInRoom(roomId).forEach((user, id) => {
                    if (newUser.id !== user.id) {
                        console.log("Notifing", newUser.id, "about", user.id)
                        const userRoom = user.getCurrentRoom();
                        const isBroadcatingVideo = user.isBroadcastingVideo();
                        let isConnected = userRoom === roomId;
                        let audioState = user.getAudioState();
                        newUser.userJoinedChannel({
                            id: user.id,
                            roomId: roomId,
                            isConnected: isConnected,
                            deaf: audioState.deaf,
                            muted: audioState.muted,
                            broadcastingVideo: isBroadcatingVideo
                        });
                    }
                });
            }
        } else console.log(colors.changeColor("red", "Can't add user " + id + " to room " + roomId + ", user is not connected to socket"));
    }

    getUsersInRoom(id) {
        if (this.rooms.has(id)) return this.rooms.get(id).users;
    }
}

module.exports = Rooms;