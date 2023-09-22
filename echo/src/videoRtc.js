import { ep } from "./index";

const { ipcRenderer } = window.require('electron');
const sdpTransform = require('sdp-transform');
const goodH264Settings = "x-google-max-bitrate=10000;x-google-min-bitrate=0;x-google-start-bitrate=6000";

const ICE_SERVERS = [{
    username: 'echo',
    credential: 'echo123',
    urls: ["turn:turn.kuricki.com:6984"]
}];

class videoRtc {
    constructor(id, videoSourceId = null, outputDeviceId = 'default', volume = 1.0) {
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
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: videoSourceId,
                    width: { min: 800, ideal: 1920, max: 1920 },
                    height: { min: 600, ideal: 1080, max: 1080 },
                    frameRate: { min: 30, ideal: 60, max: 60 },
                }
            },
        };
    }

    setDevice(deviceId) {
        this.videoSourceId = deviceId;
        this.constraints.video.mandatory.chromeMediaSourceId = deviceId;
    }

    async startSharing() {
        if (this.isTransmitting) {
            console.error("Already transmitting");
            return;
        }

        if (!this.videoSourceId) {
            console.error("No video source id");
            return;
        }

        this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
        if (!this.peer) {
            this.peer = this.createPeer();
        }

        this.stream.getTracks().forEach((track) => {
            this.peer.addTrack(track, this.stream);
        });

        this.isTransmitting = true;
    }

    stopSharing() {
        if (!this.isTransmitting) {
            console.error("Not transmitting");
            return;
        }

        this.stream.getTracks().forEach((track) => {
            track.stop();
        });
        this.stream = null;
        ep.stopVideoBroadcast({ id: this.id });

        this.isTransmitting = false;
    }

    addCandidate(candidate) {
        if (this.peer) {
            this.peer.addIceCandidate(candidate);
        }
    }

    getVideo(remoteId) {
        let ri = String(remoteId);
        if (this.streamIds.has(ri)) {
            return this.inputstreams.filter((stream) => {
                return stream.stream.id === this.streamIds.get(ri);
            })[0].stream;
        } else {
            console.error("No stream id for", ri);
            return null;
        }
    }

    createPeer() {
        const peer = new RTCPeerConnection({
            iceServers: ICE_SERVERS
        });

        peer.onnegotiationneeded = () => { this.handleNegotiationNeededEvent(peer) };
        peer.onicecandidate = (e) => {
            if (e.candidate) {
                console.log("Sending ice candidate", e.candidate)
                ep.sendVideoIceCandidate({
                    candidate: e.candidate,
                    id: this.id
                });
            }
        };

        peer.ontrack = (e) => { this.handleTrackEvent(e) };
        peer.onconnectionstatechange = () => {
            if (peer.connectionState === 'failed') {
                //peer.restartIce();
            }
        }

        peer.oniceconnectionstatechange = () => {
            if (peer.iceconnectionState === 'failed') {
                //peer.restartIce()
            }
        }

        return peer;
    }

    async subscribeToVideo(id) {
        console.log("Subscribing to video from", id);
        ep.subscribeVideo({
            senderId: id,
            receiverId: this.id
        }, (a) => {
            if (a) {
                console.log("Got video stream for id", id, a);
                this.streamIds.set(String(id), a);
            } else {
                console.error("Failed to subscribe to video from", id);
                return;
            }
        })
    }

    unsubscribeFromVideo(id = null) {
        if (id) {
            let streamId = this.streamIds.get(String(id));
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
        let senderCodecs = RTCRtpSender.getCapabilities('video').codecs.filter((codec) => {
            console.log(codec);
            return codec.mimeType === 'video/VP9';
        });

        let receiverCodecs = RTCRtpReceiver.getCapabilities('video').codecs.filter((codec) => {
            console.log(codec);
            return codec.mimeType === 'video/VP9';
        });
        peer.getTransceivers().forEach((transceiver) => {
            transceiver.setCodecPreferences([...senderCodecs, ...receiverCodecs]);
        });


        const offer = await peer.createOffer();
        var arr = offer.sdp.split('\r\n');
        arr.forEach((line, index) => {
            if (line.startsWith('a=fmtp:')) {
                arr[index] = line.concat(';'.concat(goodH264Settings));
            } else if (line.startsWith('a=mid:1') || line.startsWith('a=mid: video')) {
                arr[index] = line.concat('\r\nb=AS:20000');
            }
        });

        offer.sdp = arr.join('\r\n');

        await peer.setLocalDescription(offer);

        ep.negotiateVideoRtc({
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
                var arr = answer.sdp.split('\r\n');
                arr.forEach((line, index) => {
                    if (line.startsWith('a=fmtp:')) {
                        arr[index] = line.concat(';'.concat(goodH264Settings));
                    } else if (line.startsWith('a=mid:1') || line.startsWith('a=mid: video')) {
                        arr[index] = line.concat('\r\nb=AS:20000');
                    }
                });

                answer.sdp = arr.join('\r\n');
                console.log(answer.sdp)

                this.peer.setLocalDescription(answer).then(() => {
                    cb(this.peer.localDescription);
                });
            });
        });
    }

    handleTrackEvent(e) {
        if (e.track.kind === "video") {
            console.log("Got video track", e);
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
            console.warn("Stream already closed");
        }

        if (this.peer) {
            this.peer.close();
            this.peer = null;
        } else {
            console.warn("Peer already closed");
        }

        ep.stopVideoBroadcast({ id: this.id });
    }

    static async getVideoSources() {
        const srcs = await ipcRenderer.invoke("getVideoSources");
        return srcs.filter((src) => {
            return (src.thumbnail.getSize().width > 0 && src.thumbnail.getSize().height > 0);
        });
    }
}

export default videoRtc;