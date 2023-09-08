
const webrtc = require("wrtc");
const sdpTransform = require("sdp-transform");

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
            peer.ontrack = (e) => {
                console.log("peer.ontrack called, populating peers")
                this.peers.set(id, { peer, audioStream: e.streams[0], audioSubscriptionsIds: [] });
            };

            peer.onicecandidate = (e) => {
                user.iceCandidate(e.candidate);
            }

            const desc = new webrtc.RTCSessionDescription(sdp);
            peer.setRemoteDescription(desc)
                .then(() => {
                    console.log("User " + id + " connected and started broadcasting audio");
                    peer.createAnswer()
                        .then((answer) => {
                            let parsed = sdpTransform.parse(answer.sdp);
                            parsed.media[0].fmtp[0].config = "minptime=10;useinbandfec=1;maxplaybackrate=48000;stereo=1;maxaveragebitrate=510000";
                            answer.sdp = sdpTransform.write(parsed);

                            peer.setLocalDescription(answer)
                                .then(() => {
                                    // if the audioStream and the peer is already populated, immediately return
                                    if (this.peers.has(id)) return resolve(peer.localDescription);

                                    console.log("populating peers, but audioStream is null")
                                    this.peers.set(id, { peer, audioStream: null, audioSubscriptionsIds: [] });
                                    // respond with the payload
                                    resolve(peer.localDescription);
                                });
                        });
                });
            });
    }

    subscribeAudio(data, user) {
        /**
         * data has
         * sdp (rtc connection description)
         * receiverId (String), senderId (String)
         */

        return new Promise((resolve, reject) => {
            let {senderId, receiverId } = data;
            if (!senderId) return reject("NO-SENDER-ID");
            if (!receiverId) return reject("NO-RECEIVER-ID");
            if (typeof senderId !== "string") senderId = String(senderId);
            if (typeof receiverId !== "string") receiverId = String(receiverId);

            //if audioUsers is not in senders
            if (!this.peers.has(senderId)) return reject("NO-SENDER-CONNECTION");
            if (!this.peers.has(receiverId)) return reject("NO-RECEIVER-CONNECTION");

            //get the peer and the stream
            let outPeer = this.peers.get(receiverId).peer;
            let stream = this.peers.get(senderId).audioStream;
            let asid = this.peers.get(senderId).audioSubscriptionsIds;

            //Check if the user is already subscribed
            if (asid.includes(receiverId)) return reject("ALREADY-SUBSCRIBED");

            //If not subscribed, subscribe
            outPeer.addTransceiver(stream.getAudioTracks()[0], { direction: "sendrecv"});
            asid.push(receiverId);

            resolve(true);
        });
    }

    clearUserConnection(data) {
        /**
         * data has
         * id (String)
         */
        let { id } = data;
        if (!id) return "NO-ID";
        if (typeof id !== "string") id = String(id);

        if (this.inPeers.has(id)) {
            this.inPeers.get(id).peer.close();
            this.inPeers.delete(id);
        }

        this.outPeers = this.outPeers.filter((value, key) => {
            if (value.sender === id || value.receiver === id) {
                console.log("Closing all streams connected to user " + id);
                value.peer.close();
                return false;
            }
            return true;
        });
    }

    async stopAudioBroadcast(data) {
        /**
         * data has
         * id (String)
        */
        let { id } = data;
        if (!id) return "NO-ID";
        if (typeof id !== "string") id = String(id);

        if (this.inPeers.has(id)) {
            const { peer, audioStream } = this.inPeers.get(id);
            audioStream.getTracks().forEach(track => track.stop());
            peer.close();
            this.inPeers.delete(id);
        }

        return "OK";
    }

    async stopAudioSubscription(data) {
        /**
         * data has
         * senderId (String), receiverId (String)
         */
        let { senderId, receiverId } = data;
        if (!senderId) return "NO-SENDER-ID";
        if (!receiverId) return "NO-RECEIVER-ID";
        if (typeof senderId !== "string") senderId = String(senderId);
        if (typeof receiverId !== "string") receiverId = String(receiverId);

        this.outPeers = this.outPeers.filter((value, key) => {
            if (value.sender === senderId && value.receiver === receiverId) {
                console.log("Closing user " + receiverId + "'s connection to user " + senderId + "'s audio stream");
                value.peer.close();
                return false;
            }
            return true;
        });

        return "OK";
    }

    addCandidate(data) {
        if (this.peerConnection) {
            this.peerConnection.addIceCandidate(data.candidate);
        }
    }
}

module.exports = ServerRTC;