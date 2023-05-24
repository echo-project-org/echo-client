const ep = require('./echoProtocol')

let mediaStream = null;
let isTransmitting = false;
let node;
let context = null;
var id = localStorage.getItem('userId');

export async function startInputAudioStream() {
    id = localStorage.getItem('userId');
    if(!isTransmitting){
        ep.openConnection(id);
        
        navigator.getUserMedia({ audio: true },
            function (stream) {
                ep.sendAudioPacket(id, stream, stream);

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
                node.onaudioprocess = function (e) {
                    //Here i have the raw data
                    var left = e.inputBuffer.getChannelData(0);
                    var right = e.inputBuffer.getChannelData(1);
                    //console.log(right);
                    ep.sendAudioPacket(id, left, right);
                }

                // connect the ScriptProcessorNode with the input audio
                source.connect(node);
                // if the ScriptProcessorNode is not connected to an output the "onaudioprocess" event is not triggered in chrome
                node.connect(context.destination);
            },
            function (e) {
                alert("Audio stuff error")
                stopAudioStream();
            });
    }
}

export function stopAudioStream() {
    id = localStorage.getItem('userId');
    if(isTransmitting){
        console.log("STOPPING STREAM");
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