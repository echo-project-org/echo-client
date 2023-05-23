let audioSources = [];
let audioContexts = [];
let clientIds = []

export async function startOutputAudioStream(clientId) {
    console.log(clientId)
    if(!clientIds.includes(clientId)){
        console.log("Negri")
        var context = new AudioContext();
        var sourceNode = context.createBufferSource();

        audioSources.push(sourceNode);
        clientIds.push(clientId);
        audioContexts.push(context);

        sourceNode.connect(context.destination);
        sourceNode.start(0);
    }
}

export async function addToBuffer(clientId, left, right) {
    if(clientIds.includes(clientId)){
        let index = clientIds.indexOf(clientId);
        var audioBuffer = audioContexts[index].createBuffer(2, 4096, 48000);
        audioBuffer.getChannelData(0).set(left);
        audioBuffer.getChannelData(1).set(right);

        audioSources[index].buffer = left;
        audioSources[index].play();
    }
}