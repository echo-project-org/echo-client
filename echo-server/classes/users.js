class User {
    constructor(socket, id) {
        this.id = id;
        this.socket = socket;
        this.socketId = socket.id;
        this.serverId = null;
        this.currentRoom = 0;
        this.isDeaf = false;
        this.isMuted = false;
        this.isBroadcastingVideo = false;
        this.broadcastWithAudio = false;
        this.isPrivateCalling = false;
        this.events = {};

        this.receiveTransport = null;
        this.sendTransport = null;
        this.audioProducerId = null;
        this.audioProducer = null;
        this.audioConsumers = [];

        this.receiveVideoTransport = null;
        this.sendVideoTransport = null;
        this.videoProducerId = null;
        this.videoProducer = null;
        this.videoAudioProducer = null;
        this.videoConsumers = [];
        this.crashCountdown = null;

        this.pingInterval = setInterval(() => {
            this.socket.emit("portalTurret.areYouStillThere?");
            this.crashCountdown = setInterval(() => {
                console.log("[USER-" + this.id + "] CRASH DETECTED, DISCONNECTING");

                this.triggerEvent("exit", {
                    id: this.id,
                    roomId: this.currentRoom,
                    crashed: true,
                });
                clearInterval(this.pingInterval);
                clearInterval(this.crashCountdown);
            }, 1000);
        }, 5000);
        this.socket.on("client.thereYouAre", (callback) => { this.pongReceived() });

        // room stuff
        this.socket.on("client.audioState", (data) => {
            data.serverId = this.serverId;
            data.id = this.id;
            this.triggerEvent("audioState", data)
        });
        this.socket.on("client.join", (data) => {
            data.id = this.id;
            this.serverId = data.serverId;
            this.triggerEvent("join", data);
        });
        this.socket.on("client.end", (data) => {
            data.id = this.id;
            this.clientDisconnected(data)
        });
        this.socket.on("client.sendChatMessage", (data) => {
            data.id = this.id;
            this.triggerEvent("sendChatMessage", data)
        });
        this.socket.on("client.exit", (data) => {
            data.id = this.id;
            this.triggerEvent("exit", data)
        });
        this.socket.on("client.updateUser", (data) => {
            data.id = this.id;
            this.triggerEvent("updateUser", data)
        });

        // mediasoup
        this.socket.on("client.sendTransportConnect", (data, cb) => {
            this.receiveTransportConnect(data, cb)
        });

        this.socket.on("client.sendTransportProduce", (data, cb) => {
            this.receiveTransportProduce(data, cb);
        });

        this.socket.on("client.receiveTransportConnect", (data, cb) => {
            this.sendTransportConnect(data, cb);
        });

        this.socket.on("client.sendVideoTransportConnect", (data, cb) => {
            this.receiveVideoTransportConnect(data, cb);
        });

        this.socket.on("client.sendVideoTransportProduce", (data, cb) => {
            this.receiveVideoTransportProduce(data, cb);
        });

        this.socket.on("client.sendVideoAudioTransportProduce", (data, cb) => {
            this.receiveVideoAudioTransportProduce(data, cb);
        });

        this.socket.on("client.receiveVideoAudioTransportProduce", (data, cb) => {
            this.receiveVideoAudioTransportProduce(data, cb);
        });

        this.socket.on("client.receiveVideoTransportConnect", (data, cb) => {
            this.sendVideoTransportConnect(data, cb);
        });

        this.socket.on("client.subscribeAudio", (data, cb) => {
            this.subscribeAudio(data, cb);
        });

        this.socket.on("client.resumeStream", (data) => {
            this.resumeStream(data);
        });

        this.socket.on("client.resumeVideoStream", (data) => {
            this.resumeVideoStream(data);
        });

        this.socket.on("client.stopAudioBroadcast", (data) => {
            this.stopAudioBroadcast(data);
        });

        this.socket.on("client.unsubscribeAudio", (data) => {
            this.unsubscribeAudio(data);
        });

        this.socket.on("client.stopScreenSharing", (data) => {
            this.stopScreenSharing(data);
        });

        this.socket.on("client.startReceivingVideo", (data, cb) => {
            this.startReceivingVideo(data, cb);
        });

        this.socket.on("client.stopReceivingVideo", (data) => {
            this.stopReceivingVideo(data);
        });

        this.socket.on("client.startPrivateCall", (data) => {
            this.triggerEvent("startPrivateCall", data);
        });

        this.socket.on("client.acceptPrivateCall", (data) => {
            this.triggerEvent("acceptPrivateCall", data);
        });

        this.socket.on("client.rejectPrivateCall", (data) => {
            this.triggerEvent("rejectPrivateCall", data);
        });
        this.socket.on("client.hangupPrivateCall", (data) => {
            this.triggerEvent("hangupPrivateCall", data);
        });

        this.socket.on("client.friendAction", (data) => {
            this.triggerEvent("friendAction", data);
        });
    }

    friendAction(data) {
        this.socket.emit("server.friendAction", data);
    }

    setIsPrivateCalling(value) {
        this.isPrivateCalling = value;
    }

    privateCallRinging(data) {
        this.socket.emit("server.privateCallRinging", data);
    }

    someoneCallingMe(data) {
        this.triggerEvent("server.someoneCallingMe", data);
    }

    privateCallAccepted(data) {
        this.triggerEvent("server.privateCallAccepted", data);
    }

    privateCallRejected(data) {
        this.triggerEvent("server.privateCallRejected", data);
    }

    privateCallHangup(data) {
        this.triggerEvent("server.privateCallHangup", data);
    }

    getIsBroadcastingVideo() {
        return this.isBroadcastingVideo;
    }

    getIsBroadcastWithAudio() {
        return this.broadcastWithAudio;
    }

    clientDisconnected(data) {
        console.log("[USER-" + this.id + "] DISCONNECTED");
        clearInterval(this.pingInterval);
        clearInterval(this.crashCountdown);

        this.triggerEvent("exit", {
            id: this.id,
            roomId: this.currentRoom,
            crashed: false,
        });
        this.triggerEvent("end", data);
    }

    pongReceived() {
        this.crashCountdown && clearInterval(this.crashCountdown);
    }

    async receiveTransportConnect(data, cb) {
        try {
            if (!this.receiveTransport) {
                console.log("USER-" + this.id + " receiveTransport not found, can't connect audio");
                cb({
                    response: "error",
                    reason: "receiveTransport not found"
                });
                return;
            }
            await this.receiveTransport.connect({
                dtlsParameters: data.dtlsParameters
            });

            cb({ response: "success" });
        } catch (error) {
            console.error("Error in receiveTransportConnect", error);
            cb({ response: "error", reason: error });
        }
    }

    async receiveTransportProduce(data, cb) {
        try {
            if (!this.receiveTransport) {
                console.log("USER-" + this.id + " receiveTransport not found, can't produce audio");
                cb({
                    response: "error",
                    reason: "receiveTransport not found"
                });
                return;
            }

            if (this.audioProducer) {
                await this.audioProducer.close();
                this.audioProducer = null;
            }
            this.audioProducer = await this.receiveTransport.produce({
                id: data.id,
                kind: data.kind,
                rtpParameters: data.rtpParameters,
                appData: data.appData
            });
            this.audioProducerId = this.audioProducer.id;

            this.triggerEvent("userFullyConnectedToRoom", {
                id: this.id,
                serverId: this.serverId,
                roomId: this.currentRoom,
                muted: this.isMuted,
                deaf: this.isDeaf,
            })
            cb({
                response: "success",
                id: this.audioProducer.id
            });
        } catch (error) {
            console.error("Error in receiveTransportProduce", error);
            cb({ response: "error", reason: error });
        }
    }

    async sendTransportConnect(data, cb) {
        try {
            if (!this.sendTransport) {
                console.log("USER-" + this.id + " sendTransport not found, can't connect audio");
                cb({
                    response: "error",
                    reason: "sendTransport not found"
                });
                return;
            }
            await this.sendTransport.connect({
                dtlsParameters: data.dtlsParameters
            });

            cb({ response: "success" });
        } catch (error) {
            console.error("Error in sendTransportConnect", error);
            cb({ response: "error", reason: error });
        }
    }

    async receiveVideoTransportConnect(data, cb) {
        try {
            if (!this.receiveVideoTransport) {
                console.log("USER-" + this.id + " receiveVideoTransport not found, can't connect video");
                cb({
                    response: "error",
                    reason: "receiveVideoTransport not found"
                });
                return;
            }

            await this.receiveVideoTransport.connect({
                dtlsParameters: data.dtlsParameters
            });

            cb({ response: "success" });
        } catch (error) {
            console.error("Error in receiveVideoTransportConnect", error);
            cb({ response: "error", reason: error });
        }
    }

    async receiveVideoTransportProduce(data, cb) {
        try {
            if (!this.receiveVideoTransport) {
                console.log("USER-" + this.id + " receiveVideoTransport not found, can't produce video");
                cb({
                    response: "error",
                    reason: "receiveVideoTransport not found"
                });
                return;
            }

            if (this.videoProducer) {
                await this.videoProducer.close();
                this.videoProducer = null;
            }
            this.videoProducer = await this.receiveVideoTransport.produce({
                id: data.id,
                kind: data.kind,
                rtpParameters: data.rtpParameters,
                appData: data.appData
            });
            this.videoProducerId = this.videoProducer.id;
            this.isBroadcastingVideo = true;

            this.triggerEvent("videoBroadcastStarted", {
                id: this.id,
                roomId: this.currentRoom,
            });

            cb({
                response: "success",
                id: this.videoProducer.id
            });
        } catch (error) {
            console.error("Error in receiveVideoTransportProduce", error);
            cb({ response: "error", reason: error });
        }
    }

    async receiveVideoAudioTransportProduce(data, cb) {
        try {
            if (!this.receiveVideoTransport) {
                console.log("USER-" + this.id + " receiveVideoTransport not found, can't produce video");
                cb({
                    response: "error",
                    reason: "receiveVideoTransport not found"
                });
                return;
            }

            if (this.videoAudioProducer) {
                this.videoAudioProducer.close();
                this.videoAudioProducer = null;
            }

            this.videoAudioProducer = await this.receiveVideoTransport.produce({
                id: data.id,
                kind: data.kind,
                rtpParameters: data.rtpParameters,
                appData: data.appData
            });

            this.broadcastWithAudio = true;
            this.triggerEvent("broadcastNowHasAudio", {
                id: this.id,
                roomId: this.currentRoom,
            });

            cb({
                response: "success",
                id: this.videoAudioProducer.id
            });
        } catch (error) {
            console.error("Error in receiveVideoAudioTransportProduce", error);
            cb({ response: "error", reason: error });
        }
    }

    sendVideoTransportConnect(data, cb) {
        try {
            if (!this.sendVideoTransport) {
                console.log("USER-" + this.id + " sendVideoTransport not found, can't connect video");
                cb({
                    response: "error",
                    reason: "sendVideoTransport not found"
                });
                return;
            }

            this.sendVideoTransport.connect({
                dtlsParameters: data.dtlsParameters
            });

            cb({ response: "success" });
        } catch (error) {
            console.error("Error in sendVideoTransportConnect", error);
            cb({ response: "error", reason: error });
        }
    }

    async stopScreenSharing(data) {
        try {
            await this.videoProducer.close();
            this.isBroadcastingVideo = false;
            this.broadcastWithAudio = false;
            this.triggerEvent("videoBroadcastStop", {
                id: this.id,
                roomId: this.currentRoom,
            });
        } catch (error) {
            console.error("Error in stopScreenSharing", error);
        }
    }

    async startReceivingVideo(data, cb) {
        try {
            this.videoConsumers.forEach(async (consumer) => {
                if (consumer.senderId === data.id) {
                    await consumer.consumer.close();
                    consumer.consumer = null;
                    this.videoConsumers.splice(this.videoConsumers.indexOf(consumer), 1);
                }
            });

            if (!this.sendVideoTransport) {
                console.log("USER-" + this.id + " sendVideoTransport not found, can't consume video");
                cb({
                    response: "error",
                    reason: "sendVideoTransport not found"
                });
                return;
            }
            const consumer = await this.sendVideoTransport.consume({
                producerId: data.id + "-video",
                rtpCapabilities: data.rtpCapabilities,
                paused: true
            });

            let audioConsumer = null;
            if (this.broadcastWithAudio) {
                audioConsumer = await this.sendVideoTransport.consume({
                    producerId: data.id + "-video-audio",
                    rtpCapabilities: data.rtpCapabilities,
                    paused: false
                });
            }

            this.videoConsumers.push({
                consumer: consumer,
                audioConsumer: audioConsumer,
                senderId: data.id,
            });

            cb({
                response: "success",
                videoDescription: {
                    id: consumer.id,
                    producerId: data.id,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters,
                },
                videoAudioDescription: {
                    id: audioConsumer ? audioConsumer.id : null,
                    producerId: data.id,
                    kind: audioConsumer ? audioConsumer.kind : null,
                    rtpParameters: audioConsumer ? audioConsumer.rtpParameters : null,

                }
            });
        } catch (error) {
            console.error("Error in startReceivingVideo", error);
            cb({ response: "error", reason: error });
        }
    }

    stopReceivingVideo() {
        try {
            this.videoConsumers.forEach(async (consumer) => {
                await consumer.consumer.close();
            });
        } catch (error) {
            console.error("Error in stopReceivingVideo", error);
        }
    }

    resumeVideoStream(data) {
        //resume stream
        this.videoConsumers.forEach(async (consumer) => {
            if (consumer.senderId === data.producerId) {
                if (consumer.consumer.paused) {
                    try {
                        await consumer.consumer.resume();
                    } catch (error) {
                        console.error("Error in resumeVideoStream", error);
                        // if the consumer is already closed, remove it from the array
                        this.videoConsumers.splice(this.videoConsumers.indexOf(consumer), 1);
                    }
                }
            }
        });
    }

    async subscribeAudio(data, cb) {
        try {
            this.audioConsumers.forEach(async (consumer) => {
                if (consumer.senderId === data.id) {
                    await consumer.consumer.close();
                    consumer.consumer = null;
                    this.audioConsumers.splice(this.audioConsumers.indexOf(consumer), 1);
                }
            });

            if (!this.sendTransport) {
                console.log("USER-" + this.id + " sendTransport not found, can't consume audio");
                cb({
                    response: "error",
                    reason: "sendTransport not found"
                });
                return;
            }

            const consumer = await this.sendTransport.consume({
                producerId: data.id + "-audio",
                rtpCapabilities: data.rtpCapabilities,
                paused: true
            });

            this.audioConsumers.push({
                consumer: consumer,
                senderId: data.id,
            });

            cb({
                response: "success",
                id: consumer.id,
                producerId: data.id,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
            });
        } catch (error) {
            console.error("Error in subscribeAudio", error);
            cb({ response: "error", reason: error });
        }
    }

    async unsubscribeAudio(data) {
        try {
            this.audioConsumers.forEach(async (consumer) => {
                if (consumer.senderId === data.producerId) {
                    await consumer.consumer.close();
                }
            });
        } catch (error) {
            console.error("Error in unsubscribeAudio", error);
        }
    }

    async resumeStream(data) {
        //resume stream
        this.audioConsumers.forEach(async (consumer) => {
            if (consumer.senderId === data.producerId) {
                if (consumer.consumer.paused) {
                    try{
                        await consumer.consumer.resume();
                    } catch (error) {
                        console.error("Error in resumeStream", error);
                        // if the consumer is already closed, remove it from the array
                        this.audioConsumers.splice(this.audioConsumers.indexOf(consumer), 1);
                    }
                }
            }
        });
    }

    stopAudioBroadcast(data) {
        try {
            //stop stream
            this.audioConsumers.forEach(async (consumer) => {
                if (consumer.senderId === data.id) {
                    await consumer.consumer.close();
                }
            });
        } catch (error) {
            console.error("Error in stopAudioBroadcast", error);
        }
    }

    registerEvent(event, cb) {
        if (!this.events[event]) this.events[event] = {};
        this.events[event].cb = cb;
    }

    triggerEvent(event, data) {
        // register event and save the reference function to be called
        if (this.events[event]) this.events[event].cb(data)
        else console.error("can't trigger event", event, "NOT FOUND", this.id);
        // call same function if it exists
        if (this[event]) this[event](data);
    }

    userUpdated(data) {
        this.socket.emit("server.userUpdated", data);
    }

    // tell other clients that a user has closed the connection
    endConnection(data) {
        this.socket.emit("server.endConnection", data);
    }

    notifyUsersAboutBroadcast(data) {
        this.triggerEvent("videoBroadcastStarted", data)
    }

    notifyUsersAboutBroadcastStop(data) {
        this.triggerEvent("videoBroadcastStop", data)
    }

    videoBroadcastStarted(data) {
        this.socket.emit("server.videoBroadcastStarted", data);
    }

    broadcastNowHasAudio(data) {
        this.socket.emit("server.broadcastNowHasAudio", data);
    }

    videoBroadcastStop(data) {
        this.socket.emit("server.videoBroadcastStop", data);
    }

    /**
     * Section dedicated to send socket messages to non-sender clients
     */

    // called when remote user join the current room
    userJoinedChannel(data) {
        // if (this.currentRoom !== 0) {
        this.socket.emit("server.userJoinedChannel", data)
        // }
    }

    // send the audio state of the sender user to the non-sender users
    sendAudioState(data) {
        this.socket.emit("server.sendAudioState", data);
    }

    // update the audio state of the current user
    audioState(data) {
        this.isDeaf = data.deaf;
        this.isMuted = data.muted;
    }

    getAudioState() {
        return { deaf: this.isDeaf, muted: this.isMuted };
    }

    // you know what this does
    end(id) {
        this.currentRoom = 0;
        this.socket.disconnect();
    }

    // when user exit the channel
    exit(data) {
        this.currentRoom = 0;
    }

    // when current user join a room we start listening for packets
    join(data) {
        // set last room to current room just in case
        this.currentRoom = data.roomId;
    }

    // unused for now, could be handy in case of connection problems
    // (like reconnecting to the last room)
    setCurrentRoom(roomId) {
        //if (typeof roomId !== "string") roomId = Number(roomId);
        //if (isNaN(roomId)) return console.error("NOT A VALID ROOM NUMBER IN setCurrentRoom")
        this.currentRoom = roomId;
    }

    userLeftCurrentChannel(data) {
        // if (this.currentRoom !== 0) {
        this.socket.emit("server.userLeftChannel", data)
        // }
    }

    getCurrentRoom() {
        return this.currentRoom;
    }

    // send the chat message to the non-sender users
    receiveChatMessage(data) {
        this.socket.emit("server.receiveChatMessage", data);
    }

    setReceiveTransport(transport, rtpCapabilities) {
        this.receiveTransport = transport;
        this.socket.emit("server.receiveTransportCreated", {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
            sctpParameters: transport.sctpParameters,
            iceServers: transport.iceServers,
            iceTransportPolicy: transport.iceTransportPolicy,
            additionalSettings: transport.additionalSettings,
            rtpCapabilities: rtpCapabilities,
        });
    }

    setSendTransport(transport, rtpCapabilities) {
        this.sendTransport = transport;
        this.socket.emit("server.sendTransportCreated", {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
            sctpParameters: transport.sctpParameters,
            iceServers: transport.iceServers,
            iceTransportPolicy: transport.iceTransportPolicy,
            additionalSettings: transport.additionalSettings,
            rtpCapabilities: rtpCapabilities,
        });
    }

    setReceiveVideoTransport(transport, rtpCapabilities) {
        this.receiveVideoTransport = transport;
        this.socket.emit("server.receiveVideoTransportCreated", {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
            sctpParameters: transport.sctpParameters,
            iceServers: transport.iceServers,
            iceTransportPolicy: transport.iceTransportPolicy,
            additionalSettings: transport.additionalSettings,
            rtpCapabilities: rtpCapabilities,
        });
    }

    setSendVideoTransport(transport, rtpCapabilities) {
        this.sendVideoTransport = transport;
        this.socket.emit("server.sendVideoTransportCreated", {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
            sctpParameters: transport.sctpParameters,
            iceServers: transport.iceServers,
            iceTransportPolicy: transport.iceTransportPolicy,
            additionalSettings: transport.additionalSettings,
            rtpCapabilities: rtpCapabilities,
        });
    }

    privateCallSetReceiveTransport(transport, rtpCapabilities) {
        this.receiveTransport = transport;
        this.socket.emit("server.privateCallSetReceiveTransport", {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
            sctpParameters: transport.sctpParameters,
            iceServers: transport.iceServers,
            iceTransportPolicy: transport.iceTransportPolicy,
            additionalSettings: transport.additionalSettings,
            rtpCapabilities: rtpCapabilities,
        });
    }

    privateCallSetSendTransport(transport, rtpCapabilities) {
        this.sendTransport = transport;
        this.socket.emit("server.privateCallSetSendTransport", {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
            sctpParameters: transport.sctpParameters,
            iceServers: transport.iceServers,
            iceTransportPolicy: transport.iceTransportPolicy,
            additionalSettings: transport.additionalSettings,
            rtpCapabilities: rtpCapabilities,
        });
    }

    privateCallSetReceiveVideoTransport(transport, rtpCapabilities) {
        this.receiveVideoTransport = transport;
        this.socket.emit("server.privateCallSetReceiveVideoTransport", {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
            sctpParameters: transport.sctpParameters,
            iceServers: transport.iceServers,
            iceTransportPolicy: transport.iceTransportPolicy,
            additionalSettings: transport.additionalSettings,
            rtpCapabilities: rtpCapabilities,
        });
    }

    async clearTransports() {
        //stop and clear all transports
        if (this.audioProducer) {
            this.audioProducer.close();
            this.audioProducer = null;
        }

        if (this.videoProducer) {
            this.videoProducer.close();
            this.videoProducer = null;
        }

        if (this.audioConsumers) {
            this.audioConsumers.forEach(async (consumer) => {
                await consumer.consumer.close();
            });
            this.audioConsumers = [];
        }

        if (this.videoConsumers) {
            this.videoConsumers.forEach(async (consumer) => {
                await consumer.consumer.close();
            });
            this.videoConsumers = [];
        }

        if (this.receiveTransport) {
            this.receiveTransport.close();
        }

        if (this.sendTransport) {
            this.sendTransport.close();
        }

        if (this.receiveVideoTransport) {
            this.receiveVideoTransport.close();
        }

        if (this.sendVideoTransport) {
            this.sendVideoTransport.close();
        }


        this.receiveTransport = null;
        this.sendTransport = null;
        this.receiveVideoTransport = null;
        this.sendVideoTransport = null;
    }
}

module.exports = User;