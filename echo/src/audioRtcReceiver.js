const sdpTransform = require('sdp-transform');
const stunkServer = [
    "stun:kury.ddns.net:6984"
];
const signalServer = "http://127.0.0.1:6983";
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
        this.audioElement = new Audio();
        this.context = null;
        this.gainNode = null;
        this.personalGainNode = null;
        this.muteNode = null;


        console.log("Created receiver", this.id, this.senderId, this.deviceId, this.volume);
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
        console.log(this.audioElement, volume) //This is null, wtf
        this.personalGainNode.gain.value = volume;
        this.unmute();

        this.muted = false;
    }

    setGlobalVolume(volume){
        if(volume > 1.0 || volume < 0.0){
            console.error("Volume must be between 0.0 and 1.0", volume);
            volume = 1.0;
        }

        this.gainNode.gain.value = volume;
    }

    setDevice(deviceId){
        console.log("Setting device", deviceId);
        if(deviceId === 'default'){
            return
        }
        this.deviceId = deviceId;
        this.context.setSinkId(deviceId);
    }

    mute() {
        this.muteNode.gain.value = 0.0;
        this.isMuted = true;
    }

    unmute() {
        this.muteNode.gain.value = 1.0;
        this.isMuted = false;
    }

    close() {
        if(this.audioElement){
            this.audioElement.pause();
            this.audioElement = null;
        } else {
            console.log("Elemtn null")
        }
        if(this.stream && this.stream.getTracks()){
            this.stream.getTracks().forEach(track => track.stop());
        }
        else {
            console.log("stream null")
        }
        if(this.peer){
            this.peer.close();
        }else {
            console.log("peer null")
        }

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
        peer.ontrack = (e) => {this.handleTrackEvent(e)};
        //Handle the ice candidates
        peer.onnegotiationneeded = () => this.handleNegotiationNeededEvent(peer);

        return peer;
    }

    handleTrackEvent(e) {
        this.context = new AudioContext();
        console.log(this.deviceId)
        if(this.deviceId !== 'default' && this.deviceId){
            this.context.setSinkId(this.deviceId);
        }
        let source = this.context.createMediaStreamSource(e.streams[0]);
        let destination = this.context.destination;

        this.gainNode = this.context.createGain();
        this.personalGainNode = this.context.createGain();
        this.muteNode = this.context.createGain();

        source.connect(this.gainNode);
        this.gainNode.connect(this.personalGainNode);
        this.personalGainNode.connect(this.muteNode);
        this.muteNode.connect(destination);

        this.context.resume();

        //Need this cuz of bug in chrome
        console.log("Got track event", e)
        this.stream = e.streams[0];
        this.audioElement.srcObject = this.stream;
        this.audioElement.autoplay = true;
        if(this.deviceId !== 'default'){
            //this.audioElement.setSinkId(this.deviceId);
        }
        this.audioElement.pause();
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

    static async getAudioDevices() {
        return new Promise((resolve, reject) => {
            var out = [];
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                devices.forEach((device, id) => {
                    if (device.kind === "audiooutput" && device.deviceId !== "communications" && device.deviceId !== "default") {
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

export default audioRtcReceiver;