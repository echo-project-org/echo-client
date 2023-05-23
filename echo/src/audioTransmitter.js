var ep = require('./echoProtocol')

let mediaStream = null;
let isTransmitting = false;
let node;
let context = null;

export async function startInputAudioStream() {
    if(!isTransmitting){
        var nick = localStorage.getItem('userNick');

        ep.openConnection();
        
        navigator.getUserMedia({ audio: true },
            function (stream) {
                isTransmitting = true;
                mediaStream = stream;
                // create the MediaStreamAudioSourceNode
                context = new AudioContext();

                var source = context.createMediaStreamSource(stream);
                var recLength = 0,
                    recBuffersL = [],
                    recBuffersR = [];

                // create a ScriptProcessorNode
                if (!context.createScriptProcessor) {
                    node = context.createJavaScriptNode(4096, 2, 2);
                } else {
                    node = context.createScriptProcessor(4096, 2, 2);
                }

                // listen to the audio data, and record into the buffer
                node.onaudioprocess = function (e) {
                    recBuffersL.push(e.inputBuffer.getChannelData(0));
                    recBuffersR.push(e.inputBuffer.getChannelData(1));
                    recLength += e.inputBuffer.getChannelData(0).length;
                    //Here i have the raw data
                    console.log(e.inputBuffer.getChannelData(0));
                }

                // connect the ScriptProcessorNode with the input audio
                source.connect(node);
                // if the ScriptProcessorNode is not connected to an output the "onaudioprocess" event is not triggered in chrome
                node.connect(context.destination);
            },
            function (e) {
                // do something about errors
            });
    }
}

export function stopAudioStream() {
    if(isTransmitting){
        console.log("STOPPING STREAM");
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