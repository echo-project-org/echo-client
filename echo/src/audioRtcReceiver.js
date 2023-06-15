const sdpTransform = require('sdp-transform');

const stunkServer = "stun:stun1.l.google.com:19302";
const signalServer = "http://localhost:6983";
const goodOpusSettings = "minptime=10;useinbandfec=1;maxplaybackrate=48000;stereo=1;maxaveragebitrate=510000";

class audioRtcReceiver {
    constructor(id, senderId, deviceId = 'default', volume = 1.0) {
        this.id = id;
        this.senderId = senderId;
        this.deviceId = deviceId;
        this.volume = volume;
        this.peer = null;
        this.stream = null;
        this.isReceiving = false;
        this.isMuted = false;
        this.audioElement = null;
    }

    async init() {
        this.peer = this.createPeer();
        this.peer.addTransceiver('audio', { direction: 'recvonly' });
    }

    setVolume(volume){
        if(volume > 1.0 || volume < 0.0){
            console.error("Volume must be between 0.0 and 1.0", volume);
            volume = 1.0;
        }

        this.volume = volume;
        if(this.audioElement){
            this.audioElement.volume = this.volume;
        }

        this.muted = false;
        this.audioElement.muted = false;
    }

    setDevice(deviceId){
        this.deviceId = deviceId;
        if(this.audioElement){
            this.audioElement.setSinkId(this.deviceId);
        }
    }

    mute() {
        this.audioElement.muted = true;
        this.isMuted = true;
    }

    unmute() {
        this.audioElement.muted = false;
        this.isMuted = false;
    }

    close() {
        this.audioElement.pause();
        this.audioElement = null;
        
        this.stream.getTracks().forEach(track => track.stop());
        this.peer.close();

        this.stream = null;
        this.peer = null;

        this.isReceiving = false;
    }

    createPeer() {
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    "urls": stunkServer
                }
            ]
        });
        peer.ontrack = this.handleTrackEvent;
        //Handle the ice candidates
        peer.onnegotiationneeded = () => this.handleNegotiationNeededEvent(peer);

        return peer;
    }

    handleTrackEvent(e) {
        var x = new Audio();
        this.stream = e.streams[0];
        x.srcObject = this.stream;
        x.autoplay = true;
        x.setSinkid(this.deviceId);
        x.play();
        this.audioElement = x;
        this.isReceiving = true;
    };

    async handleNegotiationNeededEvent(peer) {
        const offer = await peer.createOffer();

        let parsed = sdpTransform.parse(offer.sdp);
        parsed.media[0].fmtp[0].config = goodOpusSettings;
        console.log(parsed)
        offer.sdp = sdpTransform.write(parsed);

        await peer.setLocalDescription(offer);
        const body = {
            sdp: peer.localDescription,
            senderId: this.senderId,
            receiverId: this.id,
        };

        fetch(signalServer + '/subscribeAudio', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        }).then((response) => {
            response.json().then((json) => {
                const desc = new RTCSessionDescription(json.sdp);
                peer.setRemoteDescription(desc).catch(e => console.log(e));
            })
        });
    }

    async getAudioDevices() {
        return new Promise((resolve, reject) => {
            var out = [];
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                devices.forEach((device, id) => {
                    if (device.kind === "audiooutput") {
                        out.push({
                            "name": device.label,
                            "id": device.deviceId
                        })
                    }
                })
    
                resolve(out);
            })
        })
    }

}