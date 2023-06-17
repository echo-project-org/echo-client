const sdpTransform = require('sdp-transform');

const stunkServer = [
    {
        username: 'echo',
        credential: 'echo123',
        urls: ["turn:kury.ddns.net:6984"]
    }
];
const signalServer = "http://kury.ddns.net:6983";
const goodOpusSettings = "minptime=10;useinbandfec=1;maxplaybackrate=48000;stereo=1;maxaveragebitrate=510000";

/**
 * @class audioRtcTransmitter
 * @classdesc A class that handles the audio transmission
 * @param {string} id - The id of the user
 * @param {string} deviceId - The id of the audio device
 * @param {float} volume - The volume of the audio
 */
class audioRtcTransmitter {
    constructor(id, deviceId = 'default', volume = 1.0) {
        this.id = id;
        this.peer = null;
        this.stream = null;
        this.deviceId = deviceId;
        this.isTransmitting = false;
        this.isMuted = false;
        this.volume = volume;
        this.gainNode = null;

        //Audio only constraints
        this.constraints = {
            audio: {
                channelCount: 2,
                sampleRate: 48000,
                sampleSize: 16,
                volume: 1.0,
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                deviceId: this.deviceId,
            },
            video: false,
        }
    }

    /**
     * @function init - Starts the audio transmission
     */
    async init() {
        //Create stream
        this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
        //Setup the volume stuff
        const context = new AudioContext();
        const source = context.createMediaStreamSource(this.stream);
        const destination = context.createMediaStreamDestination();
        this.gainNode = context.createGain();
        source.connect(this.gainNode);
        this.gainNode.connect(destination);
        //Set the volume
        this.setVolume(this.volume);
        //Create the peer
        this.peer = this.createPeer();
        //Add the tracks
        destination.stream.getTracks().forEach(track => this.peer.addTrack(track, destination.stream));
        this.isTransmitting = true;
    }

    /**
     * @function setVolume - Sets the volume of the audio
     * @param {float} volume 
     */
    setVolume(volume) {
        if (volume > 1.0 || volume < 0.0) {
            console.error("Volume must be between 0.0 and 1.0", volume);
            volume = 1.0;
        }

        this.volume = volume;
        if (this.gainNode) {
            console.log("changing volume to", volume)
            this.gainNode.gain.value = volume;
        }
    }

    mute() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.enabled = false);
            this.isMuted = true;
        }
    }

    unmute() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.enabled = true);
            this.isMuted = false;
        }
    }

    /**
     * @function createPeer - Creates the peer connection
     * @returns {RTCPeerConnection} peer - The peer connection
     */
    createPeer() {
        const peer = new RTCPeerConnection({
            iceServers: stunkServer
        });
        //Handle the ice candidates
        peer.onnegotiationneeded = () => this.handleNegotiationNeededEvent(peer);
        peer.onconnectionstatechange  = () => {
            if(peer.connectionState  === 'failed'){
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

    /**
     * @function handleNegotiationNeededEvent - Handles the negotiation needed event
     * @param {RTCPeerConnection} peer 
     */
    async handleNegotiationNeededEvent(peer) {
        const offer = await peer.createOffer();
        let parsed = sdpTransform.parse(offer.sdp);

        //Edit the sdp to make the audio sound better
        parsed.media[0].fmtp[0].config = goodOpusSettings;
        offer.sdp = sdpTransform.write(parsed);

        await peer.setLocalDescription(offer);
        const body = {
            sdp: peer.localDescription,
            id: this.id
        };

        //Send the sdp to the server
        fetch(signalServer + '/broadcastAudio', {
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

    /**
     * @function close - Closes the transmission
     */
    close() {
        //Closes the transmission
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        } else {
            console.log("Stream is null")
        }

        if (this.peer) {
            this.peer.close();
        } else {
            console.log("Peer is null")
        }

        const body = {
            id: this.id
        };
        //Send the close to the server
        fetch(signalServer + '/stopAudioBroadcast', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        this.stream = null;
        this.peer = null;
        this.isTransmitting = false;
    }

    /**
     * @function getAudioDevices - Gets the audio devices
     * @returns {Promise} - The promise that resolves when the audio devices are found
     */
    static async getAudioDevices() {
        //Gets the audio devices
        return new Promise((resolve, reject) => {
            var out = [];
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                devices.forEach((device, id) => {
                    if (device.kind === "audioinput" && device.deviceId !== "communications" && device.deviceId !== "default") {
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

export default audioRtcTransmitter;