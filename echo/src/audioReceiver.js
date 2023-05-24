let audioContexts = [];
let clientSources = [];
let clientIds = []

export async function startOutputAudioStream(clientId) {
    console.log("Creating audio out")
    if(!clientIds.includes(clientId)){
        var context = new AudioContext();
        let source = context.createBufferSource()
        source.connect(context.destination)

        clientIds.push(clientId);
        audioContexts.push(context);
        clientSources.push(source);
    }
}

export async function addToBuffer(clientId, left, right) {
    if(clientIds.includes(clientId)){
        let index = clientIds.indexOf(clientId);

        let source = clientSources[index];
        let context = audioContexts[index];
        let audioBuffer = context.createBuffer(2, 4096, 48000);
        
        audioBuffer.getChannelData(0).set(left);
        audioBuffer.getChannelData(1).set(right);

        source = context.createBufferSource()
        source.buffer = audioBuffer
        source.connect(context.destination)
        source.start();
    }
}