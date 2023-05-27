let audioContexts = [];
let clientSources = [];
let clientIds = [];
let startTimes = [];

export async function startOutputAudioStream(clientId) {
    console.log("Creating audio out")
    if (!clientIds.includes(clientId)) {
        var context = new AudioContext();
        let source = context.createBufferSource()
        source.connect(context.destination)

        clientIds.push(clientId);
        audioContexts.push(context);
        clientSources.push(source);
        startTimes.push(context.currentTime);
    } else {
        let index = clientIds.indexOf(clientId);
        var context1 = new AudioContext();
        let source = context.createBufferSource()
        source.connect(context.destination)

        audioContexts[index] = context1;
        clientSources[index] = source;
        startTimes[index] = context1.currentTime;
    }
}

export async function getAudioDevices(){
    return new Promise((resolve, reject) => {
        var out = [];
        console.log(navigator.mediaDevices.enumerateDevices())
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            devices.forEach((device, id) => {
                if(device.kind === "audiooutput"){
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


export async function stopOutputAudioStream() {
    audioContexts.forEach(e => {
        e.close();
    });

    audioContexts = [];
    clientSources = [];
    clientIds = [];
    startTimes = [];
}

var devLog = 0;

export async function addToBuffer(clientId, left, right) {
    if (devLog > 100) {
        console.log(clientIds, clientId);
        devLog = 0;
    }
    devLog++;
    if (clientIds.includes(clientId)) {
        console.log("should be pushing buffer")
        let index = clientIds.indexOf(clientId);

        let source = clientSources[index];
        let context = audioContexts[index];
        let audioBuffer = context.createBuffer(2, 4096, 48000);
        
        audioBuffer.getChannelData(0).set(left);
        audioBuffer.getChannelData(1).set(right);

        
        source = context.createBufferSource()
        source.buffer = audioBuffer
        source.connect(context.destination)

        if(startTimes[index] === 0) startTimes[index] = context.currentTime + (audioBuffer.length / audioBuffer.sampleRate)/2;
        source.start(startTimes[index]);
        startTimes[index] += audioBuffer.length / audioBuffer.sampleRate;
    }
}