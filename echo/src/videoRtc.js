const { ipcRenderer } = window.require('electron');
const sdpTransform = require('sdp-transform');
const ep = require("./echoProtocol.js");

const ICE_SERVERS = [{
    username: 'echo',
    credential: 'echo123',
    urls: ["turn:turn.kuricki.com:6984"]
}];

class videoRtc {
    constructor(id, videoSourceId, outputDeviceId = 'default', volume = 1.0) {
        this.id = id;
        this.videoSourceId = videoSourceId;
        this.outputDeviceId = outputDeviceId;
        this.volume = volume;

        this.isTransmitting = false;
        this.stream = null;
        this.peer = null;
        this.inputstreams = [];
        this.streamIds = new Map();

        this.constraints = {
            audio: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                }
            },
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: videoSourceId,
                    minWidth: 800,
                    minHeight: 600,
                    maxWidth: 1920,
                    maxHeight: 1080,
                    maxFrameRate: 60,
                    minFrameRate: 30
                }
            },
        };
    }

    async init() {
        this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
        this.peer = this.createPeer();

        this.stream.getTracks().forEach((track) => {
            this.peer.addTrack(track, this.stream);
        });

        this.isTransmitting = true;
    }

    addCandidate(candidate) {
        if (this.peer) {
            this.peer.addIceCandidate(candidate);
        }
    }

    createPeer() {
        const peer = new RTCPeerConnection({
            iceServers: ICE_SERVERS
        });

        peer.onnegotiationneeded = () => { this.handleNegotiationNeededEvent(peer) };
        peer.onicecandidate = (e) => {
            if (e.candidate) {
                ep.sendVideoIceCandidate({
                    candidate: e.candidate,
                    id: this.id
                });
            }
        };

        peer.ontrack = (e) => { this.handleTrackEvent(e) };
        peer.onconnectionstatechange = () => {
            if (peer.connectionState === 'failed') {
                peer.restartIce();
            }
        }

        peer.oniceconnectionstatechange = () => {
            if (peer.iceconnectionState === 'failed') {
                peer.restartIce()
            }
        }

        return peer;
    }

    async subscribeToVideo(id) {
        ep.subscribeVideo({
            senderId: id,
            receiverId: this.id
        }, (a) => {
            if (a) {
                this.streamIds.set(id, a);
            } else {
                console.error("Failed to subscribe to video from", id);
                return;
            }
        })
    }

    unsubscribeFromVideo(id = null) {
        if (id) {
            let streamId = this.streamIds.get(id);
            if (streamId) {
                this.inputstreams.filter((stream) => {
                    return stream.stream.id === streamId;
                }).forEach((stream) => {
                    stream.stream.getTracks().forEach((track) => {
                        track.stop();
                    });
                    stream.stream = null;
                });
            }

            ep.unsubscribeVideo({ senderId: id, receiverId: this.id });
        } else {
            this.inputstreams.forEach((stream) => {
                stream.stream.getTracks().forEach((track) => {
                    track.stop();
                });
                stream.stream = null;
            });

            this.inputstreams = [];

            for (const [key, value] of this.streamIds) {
                console.log(key, "Unsubscribing from", this.id);
                ep.unsubscribeVideo({ senderId: key, receiverId: this.id });
            }
        }
    }

    async handleNegotiationNeededEvent(peer) {
        const offer = await peer.createOffer();
        let parsed = sdpTransform.parse(offer.sdp);
        //edit sdp to make video look better
        offer.sdp = sdpTransform.write(parsed);

        await peer.setLocalDescription(offer);

        ep.broadcastVideo({
            sdp: peer.localDescription,
            id: this.id
        }, (description) => {
            const desc = new RTCSessionDescription(description);
            peer.setRemoteDescription(desc).catch((e) => console.error(e));
        })
    }

    async renegotiate(remoteOffer, cb) {
        const remoteDesc = new RTCSessionDescription(remoteOffer);
        this.peer.setRemoteDescription(remoteDesc).then(() => {
            this.peer.createAnswer().then((answer) => {
                let parsed = sdpTransform.parse(answer.sdp);
                //edit sdp to make video look better
                answer.sdp = sdpTransform.write(parsed);

                this.peer.setLocalDescription(answer).then(() => {
                    cb(this.peer.localDescription);
                });
            });
        });
    }

    handleTrackEvent(e) {
        console.log("Got track event", e);
        if (e.track.kind === "video") {
            console.log("Got video track");
            //Play video stream

            this.inputstreams.push({
                stream: e.streams[0],
            });
        }
    }

    close() {
        if (this.stream) {
            this.stream.getTracks().forEach((track) => {
                track.stop();
            });
            this.stream = null
        } else {
            console.log("Stream already closed");
        }

        if (this.peer) {
            this.peer.close();
            this.peer = null;
        } else {
            console.log("Peer already closed");
        }

        ep.stopVideoBroadcast({ id: this.id });
    }

    static async getVideoSources() {
        const srcs = await ipcRenderer.invoke("getVideoSources");
        srcs.forEach((src) => {
            console.log("Got source", src);
        });
        return srcs;
    }
}

export default videoRtc;