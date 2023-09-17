const webrtc = require("wrtc");
const sdpTransform = require("sdp-transform");

const goodH264Settings = "x-google-max-bitrate=10000;x-google-min-bitrate=0;x-google-start-bitrate=6000";

class VideoRTC {
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

    async handleNegotiationNeededEvent(peer, user) {
        console.log("Negotiation needed");
        const offer = await peer.createOffer();
        let parsed = sdpTransform.parse(offer.sdp);
        //edit the sdp to make the video look better
        parsed.media[0].fmtp[0].config = goodH264Settings;
        offer.sdp = sdpTransform.write(parsed);
        await peer.setLocalDescription(offer);

        user.videoRenegotiationNeeded({
            sdp: peer.localDescription,
            id: this.id
        }, (description) => {
            const desc = new webrtc.RTCSessionDescription(description);
            peer.setRemoteDescription(desc).catch(e => console.error(e));
        })
    }

    async broadcastVideo(data, user) {
        return new Promise((resolve, reject) => {
            let { sdp, id } = data;
            if (!id) return reject("NO-ID");
            if (typeof id !== "string") id = String(id);

            const peer = new webrtc.RTCPeerConnection({ iceServers: this.iceServers });
            this.peers.set(id, { peer, videoStream: null, videoSubscriptionsIds: [], outStreams: [] });
            peer.ontrack = (e) => {
                console.log("Got video track from user " + id);
                this.peers.set(id, { peer, videoStream: e.streams[0], videoSubscriptionsIds: [], outStreams: [] });
            };

            peer.onicecandidate = (e) => {
                user.videoIceCandidate(e.candidate);
            }

            peer.onnegotiationneeded = () => { this.handleNegotiationNeededEvent(peer, user) };

            const desc = new webrtc.RTCSessionDescription(sdp);
            peer.setRemoteDescription(desc)
                .then(() => {
                    console.log("User" + id + " connected and started broadcasting video");
                    peer.createAnswer()
                        .then((answer) => {
                            let parsed = sdpTransform.parse(answer.sdp);
                            //edit the sdp to make the video look better
                            parsed.media[0].fmtp[0].config = goodH264Settings;
                            answer.sdp = sdpTransform.write(parsed);

                            peer.setLocalDescription(answer)
                                .then(() => {
                                    if (this.peers.has(id)) return resolve(peer.localDescription);
                                    this.peers.set(id, { peer, videoStream: null, videoSubscriptionsIds: [] });
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
        let newStream = this.peers.get(id).videoStream.clone();

        this.peers.forEach((peer, _) => {
            peer.outStreams.forEach(stream => {
                if (stream.id === id) {
                    stream.senders.forEach(sender => {
                        sender.replaceTrack(newStream.getTracks()[0]);
                    });
                }
            });

            stream.stream = newStream;
        }); 
    }

    subscribeVideo(data, user) {
        return new Promise((resolve, reject) => {
            let { senderId, receiverId } = data;
            if (!senderId) return reject("NO-SENDER-ID");
            if (!receiverId) return reject("NO-RECEIVER-ID");
            if (typeof senderId !== "string") senderId = String(senderId);
            if (typeof receiverId !== "string") receiverId = String(receiverId);

            if (!this.peers.has(senderId)) return reject("SENDER-NOT-FOUND");
            if (!this.peers.has(receiverId)) return reject("RECEIVER-NOT-FOUND");

            let outPeer = this.peers.get(senderId).peer;
            let stream = this.peers.get(senderId).videoStream;
            let vsid = this.peers.get(receiverId).videoSubscriptionsIds;

            if (vsid.includes(senderId)) return reject("ALREADY-SUBSCRIBED");
            console.log("User " + receiverId + " subscribed to " + senderId + "'s video");
            //if not subscribed, subscribe
            let senders = [];
            stream.getTracks().forEach((track) => {
                let sender = outPeer.addTrack(track, stream);
                senders.push(sender);
            });
            vsid.push(senderId);

            this.peers.get(receiverId).outStreams.push({
                id: senderId,
                stream,
                senders
            });

            resolve(stream.id);
        });
    }

    async unsubscribeVideo(data) {
        return new Promise((resolve, reject) => {
            let { senderId, receiverId } = data;
            if (!senderId) return reject("NO-SENDER-ID");
            if (!receiverId) return reject("NO-RECEIVER-ID");
            if (typeof senderId !== "string") senderId = String(senderId);
            if (typeof receiverId !== "string") receiverId = String(receiverId);

            if (!this.peers.has(senderId)) return reject("SENDER-NOT-FOUND");
            if (!this.peers.has(receiverId)) return reject("RECEIVER-NOT-FOUND");

            let vsid = this.peers.get(receiverId).videoSubscriptionsIds.filter(id => id !== senderId);
            let peer = this.peers.get(receiverId).peer;
            this.peers.get(receiverId).outStreams.forEach((stream) => {
                if(stream.id === senderId){
                    stream.senders.forEach((sender) => {
                        peer.removeTrack(sender);
                    });

                    stream = null;
                }   
            });

            this.peers.get(receiverId).outStreams = this.peers.get(receiverId).outStreams.filter(stream => stream.id !== senderId);

            if (!vsid.includes(senderId)) return reject("NOT-SUBSCRIBED");
            console.log("User " + receiverId + " unsubscribed from " + senderId + "'s video");
            //if subscribed, unsubscribe
            vsid.splice(asid.indexOf(senderId), 1);

            resolve(true);
        });
    }

    async stopVideoBroadcast(data) {
        let sender = data.id;
        console.log("User " + sender + " stopped broadcasting video");
        if (!sender) return reject("NO-ID");
        if (this.peers.has(sender)) {
            this.peers.get(sender).peer.close();
            this.peers.delete(sender);
        }
    }

    addCandidate(data) {
        let sender = data.id;
        if (!sender) {
            console.error("NO-ID");
            return;
        }
        if (!this.peers.has(sender)) {
            console.error("SENDER-NOT-FOUND");
            return;
        }

        let peer = this.peers.get(sender).peer;
        peer.addIceCandidate(data.candidate);
        console.log("User " + sender + " sent video ice candidate");
    }
}

module.exports = VideoRTC;