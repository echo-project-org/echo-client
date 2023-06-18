
const webrtc = require("wrtc");
const sdpTransform = require("sdp-transform");

class ServerRTC {
    constructor() {
        this.iceServers = [
            {
                username: 'echo',
                credential: 'echo123',
                urls: ["turn:kury.ddns.net:6984"]
            }
        ]

        // inbound rtc connections (users)
        this.inPeers = new Map();
        // outbound rtc connections (users)
        this.outPeers = new Map();
    }

    async broadcastAudio(data) {
        /**
         * data has
         * sdp (rtc connection description)
         * id (String) user making the connection
        */
        let { sdp, id } = data;
        if (!id) return "NO-ID";
        if (typeof id !== "string") id = String(id);

        const peer = new webrtc.RTCPeerConnection({ iceServers: this.iceServers });
        peer.ontrack = (e) => { this.inPeers.set(id, { peer, audioStream: e.streams[0] }); };
        const desc = new webrtc.RTCSessionDescription(sdp);
        await peer.setRemoteDescription(desc);

        const answer = await peer.createAnswer();
        let parsed = sdpTransform.parse(answer.sdp);
        parsed.media[0].fmtp[0].config = "minptime=10;useinbandfec=1;maxplaybackrate=48000;stereo=1;maxaveragebitrate=510000";
        answer.sdp = sdpTransform.write(parsed);

        await peer.setLocalDescription(answer);

        // TODO: check if inPeers.audioStream is not null, if so
        // do not set the audioStream to null

        this.inPeers.set(id, { peer, audioStream: null });
        // respond with the payload
        return peer.localDescription;
    }

    async subscribeAudio(data) {
        /**
         * data has
         * sdp (rtc connection description)
         * receiverId (String), senderId (String)
         */

        let { sdp, senderId, receiverId } = data;
        if (!senderId) return "NO-SENDER-ID";
        if (!receiverId) return "NO-RECEIVER-ID";
        if (typeof senderId !== "string") senderId = String(senderId);
        if (typeof receiverId !== "string") receiverId = String(receiverId);

        //if audioUsers is not in senders
        if (!this.inPeers.has(senderId)) return "NO-SENDER-CONNECTION";

        if (this.outPeers.has(receiverId)) {
            this.outPeers.get(receiverId).close();
            this.outPeers.delete(receiverId);
        }

        const peer = new webrtc.RTCPeerConnection({ iceServers: this.iceServers });
        const desc = new webrtc.RTCSessionDescription(sdp);
        await peer.setRemoteDescription(desc);
        
        console.log("User " + this.receiver + " connected to user " + this.sender + "'s audio stream");
        const stream = this.inPeers.get(senderId).audioStream;
        stream.getTracks().forEach(track => peer.addTrack(track, stream));

        const answer = await peer.createAnswer();
        let parsed = sdpTransform.parse(answer.sdp);
        parsed.media[0].fmtp[0].config = "minptime=10;useinbandfec=1;maxplaybackrate=48000;stereo=1;maxaveragebitrate=510000";
        answer.sdp = sdpTransform.write(parsed);
        await peer.setLocalDescription(answer);
        
        this.outPeers.set(receiverId, { peer });

        return peer.localDescription;
    }

    async stopAudioBroadcast(data) {
        /**
         * data has
         * id (String)
        */
        let { id } = data;
        if (!id) {
            return res.status(400).json({ message: "Provide a valid id" });
        }

        id = String(id);

        if (audioUsers.includes(id)) {
            const index = audioUsers.indexOf(id);
            audioStreams[index].getTracks().forEach(track => track.stop());
            audioStreams[index] = null;
            inPeers[index].close();
            inPeers[index] = null;

            audioUsers.splice(index, 1);
            audioStreams.splice(index, 1);
            inPeers.splice(index, 1);
        }

        return res.status(200).json({ message: "Broadcast stopped" });
    }
}

module.exports = ServerRTC;