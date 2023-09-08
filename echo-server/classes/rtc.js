
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
            peer.setRemoteDescription(desc).catch(e => console.log(e));
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
            peer.ontrack = (e) => {
                console.log("peer.ontrack called, populating peers")
                this.peers.set(id, { peer, audioStream: e.streams[0], audioSubscriptionsIds: [] });
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
                            parsed.media[0].fmtp[0].config = goodOpusSettings;
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
            let stream = this.peers.get(senderId).audioStream;
            let asid = this.peers.get(receiverId).audioSubscriptionsIds;

            //Check if the user is already subscribed
            if (asid.includes(senderId)) return reject("ALREADY-SUBSCRIBED");
            console.log("User " + receiverId + " subscribed to user " + senderId + "'s audio stream", stream);
            //If not subscribed, subscribe
            stream.getAudioTracks().forEach(track => outPeer.addTrack(track, stream));
            asid.push(senderId);

            resolve(true);
        });
    }

    clearUserConnection(data) {

    }

    async stopAudioBroadcast(data) {

    }

    async stopAudioSubscription(data) {

    }

    addCandidate(data) {
        if (this.peerConnection) {
            this.peerConnection.addIceCandidate(data.candidate);
        }
    }

    renegotiationAnswer(data) {

    }
}

module.exports = ServerRTC;