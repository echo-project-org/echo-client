class User {
    constructor(socket, id) {
        this.id = id;
        this.socket = socket;
        this.socketId = socket.id;
        this.currentRoom = 0;
        this.isDeaf = false;
        this.isMuted = false;
        this.events = {};

        this.receiveTransport = null;
        this.sendTransport = null;
        this.audioProducerId = null;
        this.audioConsumers = [];

        this.receiveVideoTransport = null;
        this.sendVideoTransport = null;
        this.videoProducerId = null;
        this.videoConsumers = [];

        // room stuff
        this.socket.on("client.audioState", (data) => { this.triggerEvent("audioState", data) });
        this.socket.on("client.ping", (callback) => { callback(); });
        this.socket.on("client.join", (data) => this.triggerEvent("join", data));
        this.socket.on("client.end", (data) => this.triggerEvent("end", data));
        this.socket.on("client.sendChatMessage", (data) => this.triggerEvent("sendChatMessage", data));
        this.socket.on("client.exit", (data) => this.triggerEvent("exit", data));
        this.socket.on("client.updateUser", (data) => this.triggerEvent("updateUser", data));

        // mediasoup
        this.socket.on("client.sendTransportConnect", (data, cb) =>
            this.receiveTransportConnect(data, cb)
        );

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

        this.socket.on("client.receiveVideoTransportConnect", (data, cb) => {
            this.sendVideoTransportConnect(data, cb);
        });

        this.socket.on("client.subscribeAudio", (data, cb) => {
            this.subscribeAudio(data, cb); 
        });

        this.socket.on("client.resumeStreams", (data) => {
            this.resumeStreams(data);
        });
    }

    async receiveTransportConnect(data, cb) {
        console.log("transportConnect", data);
        await this.receiveTransport.connect({
            dtlsParameters: data.dtlsParameters
        });

        cb(true);
    }

    async receiveTransportProduce(data, cb) {
        console.log("transportProduce", data);
        const producer = await this.receiveTransport.produce({
            id: data.id,
            kind: data.kind,
            rtpParameters: data.rtpParameters,
            appData: data.appData
        });
        this.audioProducerId = producer.id;
        console.log("producer", producer.id)
        cb({
            id: producer.id
        });
    }

    async sendTransportConnect(data, cb) {
        console.log("sendTransportConnect", data);
        await this.sendTransport.connect({
            dtlsParameters: data.dtlsParameters
        });

        cb(true);
    }

    async receiveVideoTransportConnect(data, cb) {
        console.log("receiveVideoTransportConnect", data);
        await this.receiveVideoTransport.connect({
            dtlsParameters: data.dtlsParameters
        });

        cb(true);
    }

    async receiveVideoTransportProduce(data, cb) {
        console.log("receiveVideoTransportProduce", data);
        const producer = await this.receiveVideoTransport.produce({
            id: data.id,
            kind: data.kind,
            rtpParameters: data.rtpParameters,
            appData: data.appData
        });
        this.videoProducerId = producer.id;
        console.log("producer", producer.id)
        cb({
            id: producer.id
        });
    }

    sendVideoTransportConnect(data, cb) {
        console.log("sendVideoTransportConnect", data);
        this.sendVideoTransport = data;
        cb(true);
    }

    async subscribeAudio(data, cb) {
        console.log("User " + this.id + " subscribeAudio" + data.id);
        const consumer = await this.receiveTransport.consume({
            producerId: data.id + "-audio",
            rtpCapabilities: data.rtpCapabilities,
            paused: true
        });

        this.audioConsumers.push({
            consumer: consumer,
            senderId: data.id,
        });

        cb({
            id: consumer.id,
            producerId: data.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
        });
    }

    async resumeStreams() {
        //resume all streams
        this.audioConsumers.forEach(async (consumer) => {
            if(consumer.consumer.paused){
                await consumer.consumer.resume();
            }
        });
    }

    registerEvent(event, cb) {
        console.log("event", event, "registered")
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
        console.log("deaf request from", data)
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
        if (typeof roomId !== "number") roomId = Number(roomId);
        if (isNaN(roomId)) return console.error("NOT A VALID ROOM NUMBER IN setCurrentRoom")
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
}

module.exports = User;