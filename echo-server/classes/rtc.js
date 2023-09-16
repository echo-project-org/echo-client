
const webrtc = require("wrtc");
const sdpTransform = require("sdp-transform");
const goodOpusSettings = "minptime=10;useinbandfec=1;maxplaybackrate=48000;stereo=1;maxaveragebitrate=510000";

class ServerRTC {
    constructor() {
        this.iceServers = [
            {
                username: 'echo',
                credential: 'echo123',
                urls: ["turn:turn.kuricki.com:6984"]
            }
        ]

        // inbound rtc connections (users)
        this.peers = new Map();
    }


    /**
     * @function handleNegotiationNeededEvent - Handles the negotiation needed event
     * @param {RTCPeerConnection} peer 
     */
    async handleNegotiationNeededEvent(peer, user) {
        console.log("Negotiation needed");
        const offer = await peer.createOffer();
        let parsed = sdpTransform.parse(offer.sdp);

        //Edit the sdp to make the audio sound better
        parsed.media[0].fmtp[0].config = goodOpusSettings;
        offer.sdp = sdpTransform.write(parsed);

        await peer.setLocalDescription(offer);

        user.renegotiationNeeded({
            sdp: peer.localDescription,
            id: this.id
        }, (description) => {
            const desc = new webrtc.RTCSessionDescription(description);
            peer.setRemoteDescription(desc).catch(e => console.error(e));
        })
    }

    async broadcastAudio(data, user) {
        /**
         * data has
         * sdp (rtc connection description)
         * id (String) user making the connection (sender)
         */
        return new Promise((resolve, reject) => {
            let { sdp, id } = data;
            if (!id) return reject("NO-ID");
            if (typeof id !== "string") id = String(id);

            const peer = new webrtc.RTCPeerConnection({ iceServers: this.iceServers });
            this.peers.set(id, { peer, audioStream: null, audioSubscriptionsIds: [], outStreams: [] });

            peer.ontrack = (e) => {
                console.log("Got augio track from user " + id);
                this.peers.set(id, { peer, audioStream: e.streams[0], audioSubscriptionsIds: [], outStreams: [] });
            };

            peer.onicecandidate = (e) => {
                user.iceCandidate(e.candidate);
            }

            peer.onnegotiationneeded = () => { this.handleNegotiationNeededEvent(peer, user) };

            const desc = new webrtc.RTCSessionDescription(sdp);
            peer.setRemoteDescription(desc)
                .then(() => {
                    console.log("User " + id + " connected and started broadcasting audio");
                    peer.createAnswer()
                        .then((answer) => {
                            let parsed = sdpTransform.parse(answer.sdp);
                            parsed.media.forEach((media) => {
                                media.fmtp[0].config = goodOpusSettings;
                            });
                            answer.sdp = sdpTransform.write(parsed);

                            peer.setLocalDescription(answer)
                                .then(() => {
                                    // if the audioStream and the peer is already populated, immediately return
                                    if (this.peers.has(id)) return resolve(peer.localDescription);
                                    this.peers.set(id, { peer, audioStream: null, audioSubscriptionsIds: [] });
                                    // respond with the payload
                                    resolve(peer.localDescription);
                                });
                        });
                });
        });
    }

    handleStreamChanged(data) {
        let { id, streamId } = data;
        if (!id) return console.error("NO-ID");
        if (!streamId) return console.error("NO-STREAM-ID");
        if (typeof id !== "string") id = String(id);
        if (typeof streamId !== "string") streamId = String(streamId);
        if (!this.peers.has(id)) return console.error("NO-CONNECTION");
        //get the new stream
        let newStream = this.peers.get(id).audioStream.clone();

        this.peers.forEach((peer, userId) => {
            peer.outStreams.forEach(stream => {
                if (stream.id === id) {
                    stream.senders.forEach(sender => {
                        sender.replaceTrack(newStream.getAudioTracks()[0]);
                    });
                }
            });
        }); 
    }

    subscribeAudio(data, user) {
        /**
         * data has
         * receiverId (String), senderId (String)
         */

        return new Promise((resolve, reject) => {
            let { senderId, receiverId } = data;
            if (!senderId) return reject("NO-SENDER-ID");
            if (!receiverId) return reject("NO-RECEIVER-ID");
            if (typeof senderId !== "string") senderId = String(senderId);
            if (typeof receiverId !== "string") receiverId = String(receiverId);

            //if audioUsers is not in senders
            if (!this.peers.has(senderId)) return reject("NO-SENDER-CONNECTION");
            if (!this.peers.has(receiverId)) return reject("NO-RECEIVER-CONNECTION");

            //get the peer and the stream
            let outPeer = this.peers.get(receiverId).peer;
            let stream = this.peers.get(senderId).audioStream.clone();
            let asid = this.peers.get(receiverId).audioSubscriptionsIds;

            //Check if the user is already subscribed
            if (asid.includes(senderId)) return reject("ALREADY-SUBSCRIBED");
            console.log("User " + receiverId + " subscribed to user " + senderId + "'s audio stream", stream);
            //If not subscribed, subscribe
            let senders = [];
            stream.getAudioTracks().forEach(track => {
                let sender = outPeer.addTrack(track, stream);
                let params = sender.getParameters();

                params.encodings.forEach(encoding => {
                    encoding.maxBitrate = 510000;
                });
                sender.setParameters(params);
                senders.push(sender);
            });

            asid.push(senderId);
            this.peers.get(receiverId).outStreams.push({ id: senderId, stream, senders });

            resolve(stream.id);
        });
    }

    async unsubscribeAudio(data) {
        /**
         * data has
         * senderId (String), receiverId (String)
         */
        return new Promise((resolve, reject) => {
            let { senderId, receiverId } = data;
            if (!senderId) return reject("NO-SENDER-ID");
            if (!receiverId) return reject("NO-RECEIVER-ID");
            if (typeof senderId !== "string") senderId = String(senderId);
            if (typeof receiverId !== "string") receiverId = String(receiverId);
            if (!this.peers.has(senderId)) return reject("NO-SENDER-CONNECTION");
            if (!this.peers.has(receiverId)) return reject("NO-RECEIVER-CONNECTION");

            //Remove aside from the audioSubscriptionsIds
            this.peers.get(receiverId).audioSubscriptionsIds = this.peers.get(receiverId).audioSubscriptionsIds.filter(id => id !== senderId);

            //Remove stop tracks from the peer
            let peer = this.peers.get(receiverId).peer;
            this.peers.get(receiverId).outStreams.forEach(stream => {
                if (stream.id === senderId) {
                    stream.senders.forEach(sender => {
                        peer.removeTrack(sender);
                    });

                    stream = null;
                }
            });

            //Remove the stream from the outStreams
            this.peers.get(receiverId).outStreams = this.peers.get(receiverId).outStreams.filter(stream => stream.id !== senderId);

            console.log("User " + receiverId + " unsubscribed from user " + senderId + "'s audio stream");
            resolve(true);
        });
    }

    clearUserConnection(data) {
        let sender = data.id;
        console.log("User " + sender + " disconnected, clearing connection");
        if (!sender) return "NO-ID";
        if (this.peers.has(sender)) {
            let peer = this.peers.get(sender).peer;
            peer.close();
            this.peers.delete(sender);
        }
    }

    async stopAudioBroadcast(data) {
        let sender = data.id;
        console.log("User" + sender + " requested stop broadcast");
        if (!sender) return "NO-ID";
        if (this.peers.has(sender)) {
            console.log("User " + sender + " stopped broadcasting audio, closing connection");
            let peer = this.peers.get(sender).peer;
            peer.close();
            this.peers.delete(sender);
        }
    }

    addCandidate(data) {
        let sender = data.id;
        console.log("User " + sender + " sent ice candidate")
        if (!sender) {
            console.error("NO-ID");
            return;
        };
        if (!this.peers.has(sender)) {
            console.error("SENDER-NOT-FOUND");
            return;
        };
        let peer = this.peers.get(sender).peer;
        peer.addIceCandidate(data.candidate);
    }
}

module.exports = ServerRTC;