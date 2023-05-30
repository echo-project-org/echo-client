const ep = require('./echoProtocol')
const ar = require('./audioReceiver')

let mediaStream = null;
let isTransmitting = false;
let node;
let context = null;
var id = localStorage.getItem('id');
var audioDeviceId = localStorage.getItem('inputAudioDeviceId');
var micVolume = localStorage.getItem('micVolume');

var muted = false;

export function toggleMute(bool) {
    // console.log("setting mute to", bool)
    muted = bool;
}

export function setMicVolume(volume) {
    localStorage.setItem('micVolume', volume);
    micVolume = volume;
    if(isTransmitting){
        stopAudioStream();
        startInputAudioStream();
    }
}

export function setAudioDevice(device) {
    localStorage.setItem('inputAudioDeviceId', device);
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
                volume: micVolume,
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                deviceId: audioDeviceId,
            },
        }, function (stream) {
            isTransmitting = true;
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
                if (!muted) ep.sendAudioPacket(id, left, right);
                //ar.addToBuffer(id, left, right)
            }

            // connect the ScriptProcessorNode with the input audio
            source.connect(node);
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
        ep.closeConnection(id)
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