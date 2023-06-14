const ep = require('./echoProtocol')
const ar = require('./audioReceiver')

let mediaStream = null;
let isTransmitting = false;
let node;
let context = null;
var id = localStorage.getItem('id');
var audioDeviceId = localStorage.getItem('inputAudioDeviceId');
var micVolume = localStorage.getItem('micVolume');
let gainNode;
let stream;

let peer;

var muted = false;

export function toggleMute(bool) {
    // console.log("setting mute to", bool)
    muted = bool;
}

export function setMicVolume(volume) {
    micVolume = volume;
}

export function setAudioDevice(device) {
    audioDeviceId = device;

    if (isTransmitting) {
        stopAudioStream();
        startInputAudioStream();
    }
}

export async function getAudioDevices() {
    return new Promise((resolve, reject) => {
        var out = [];
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            devices.forEach((device, id) => {
                if (device.kind === "audioinput") {
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

function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                "urls": "stun:stun1.l.google.com:19302"
            }
        ]
    });
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
}

async function handleNegotiationNeededEvent(peer) {
    const offer = await peer.createOffer();
    console.log("offer", offer.sdp);
    
    await peer.setLocalDescription(offer);
    const body = {
        sdp: peer.localDescription,
        id: id
    };

    fetch('http://localhost:6983/broadcastAudio', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    }).then((response) => {
        response.json().then((json) => {
            console.log(json.sdp.sdp)
            const desc = new RTCSessionDescription(json.sdp);
            peer.setRemoteDescription(desc).catch(e => console.log(e));
            console.log(peer)
        })
    });
}

export async function startInputAudioStream() {
    id = localStorage.getItem('id');
    audioDeviceId = localStorage.getItem('inputAudioDeviceId');
    micVolume = localStorage.getItem('micVolume');
    if (!micVolume) {
        micVolume = 1;
    }

    if (!isTransmitting) {
        console.log(">>>> STARTING STREAM")
        stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 2,
                sampleRate: 48000,
                sampleSize: 16,
                volume: 1,
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                deviceId: audioDeviceId,
            }
        });

        peer = createPeer();
        stream.getTracks().forEach(track => peer.addTrack(track, stream));

        let asd = peer.getTransceivers()[0].sender.getParameters().codecs;
        console.log(asd);
    }
}

export function stopAudioStream() {
    id = localStorage.getItem('id');
    if (isTransmitting) {
        console.log(">>>> STOPPING STREAM");
        if (mediaStream) {
            mediaStream.getAudioTracks().forEach((track) => {
                track.stop(); // Stop each track in the media stream
            });
            context.suspend();
            mediaStream = null; // Reset the media stream variable
        }

        isTransmitting = false;
    }
};