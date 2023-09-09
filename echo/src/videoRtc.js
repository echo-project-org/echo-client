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

    static async getVideoSources() {
        const srcs = await ipcRenderer.invoke("getVideoSources");
        srcs.forEach((src) => {
            console.log("Got source", src);
        });
        return srcs;
    }
}

export default videoRtc;