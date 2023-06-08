import axios from 'axios';

axios.defaults.baseURL = "http://127.0.0.1:6983/";

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

    if(isTransmitting){
        stopAudioStream();
        startInputAudioStream();
    }
}

export async function getAudioDevices(){
    return new Promise((resolve, reject) => {
        var out = [];
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            devices.forEach((device, id) => {
                if(device.kind === "audioinput"){
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
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
}

async function handleNegotiationNeededEvent(peer) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
        sdp: peer.localDescription,
        id
    };

    let options = {
        method: "POST",
        cache: 'no-cache',
        body: JSON.stringify(payload),
    }

    fetch('http://127.0.0.1:6983/broadcastAudio', options).then((response) => {
        response.json().then((json) => {
            const desc = new RTCSessionDescription(json.sdp);
            peer.setRemoteDescription(desc).catch(e => console.log(e));
        }
    )});
}

export async function startInputAudioStream() {
    id = localStorage.getItem('id');
    audioDeviceId = localStorage.getItem('inputAudioDeviceId');
    micVolume = localStorage.getItem('micVolume');
    if(!micVolume) {
        micVolume = 1;
    }

    if (!isTransmitting) {
        console.log(">>>> STARTING STREAM")
        navigator.getUserMedia({
            audio: {
                channelCount: 2,
                sampleRate: 48000,
                sampleSize: 16,
                volume: 1,
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                deviceId: audioDeviceId,
            },
        }, function (stream) {
            isTransmitting = true;
            peer = createPeer();
            stream.getTracks().forEach(track => peer.addTrack(track, stream));
            
            mediaStream = stream;
            // create the MediaStreamAudioSourceNode
            context = new AudioContext();
            
            var source = context.createMediaStreamSource(stream);

            // create a ScriptProcessorNode
            if (!context.createScriptProcessor) {
                node = context.createJavaScriptNode(4096, 2, 2);
            } else {
                node = context.createScriptProcessor(4096, 2, 2);
            }

            // listen to the audio data, and record into the buffer
            node.onaudioprocess = async function (e) {
                //Here i have the raw data
                var left = e.inputBuffer.getChannelData(0);
                var right = e.inputBuffer.getChannelData(1);
                //if (!muted) ep.sendAudioPacket(id, left, right);

                micVolume = localStorage.getItem('micVolume');
                if(micVolume){
                    gainNode.gain.value = micVolume;
                }

                let a = localStorage.getItem('inputAudioDeviceId');
                if(a && a !== "default" && a !== audioDeviceId){
                    audioDeviceId = a;
                }
                
            }
            gainNode = context.createGain();
            if(micVolume){
                gainNode.gain.value = micVolume;
            }
            
            source.connect(gainNode);
            gainNode.connect(node);
            // if the ScriptProcessorNode is not connected to an output the "onaudioprocess" event is not triggered in chrome
            node.connect(context.destination);
        }, function (e) {
            alert("Audio stuff error")
            stopAudioStream();
        });
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