let audioContexts = [];
let clientSources = [];
let clientIds = [];
let startTimes = [];
let audioDeviceId = localStorage.getItem('outputAudioDeviceId')

export async function syncAudio(){
    clientIds.forEach((id) => {
        let index = clientIds.indexOf(id);
        audioDeviceId = localStorage.getItem('outputAudioDeviceId')

        var context1 = new AudioContext();
        if(audioDeviceId){
            if(audioDeviceId !== "default")
                context1.setSinkId(audioDeviceId);
        }

        let source = context1.createBufferSource()
        source.connect(context1.destination)

        audioContexts[index] = context1;
        clientSources[index] = source;
        startTimes[index] = context1.currentTime;
    })
}

export function setAudioDevice(device) {
    localStorage.setItem('outputAudioDeviceId', device);
    audioDeviceId = device;
}

export async function startOutputAudioStream(clientId) {
    console.log("Creating audio out")
    audioDeviceId = localStorage.getItem('outputAudioDeviceId')
    if (!clientIds.includes(clientId)) {
        var context = new AudioContext();
        if(audioDeviceId){
            if(audioDeviceId !== "default")
                context.setSinkId(audioDeviceId);
        }
        let source = context.createBufferSource()
        source.connect(context.destination)

        clientIds.push(clientId);
        audioContexts.push(context);
        clientSources.push(source);
        startTimes.push(context.currentTime);
    } else {
        let index = clientIds.indexOf(clientId);
        if(audioDeviceId){
            if(audioDeviceId !== "default")
                context.setSinkId(audioDeviceId);
        }
        var context1 = new AudioContext();
        let source = context1.createBufferSource()
        source.connect(context1.destination)

        audioContexts[index] = context1;
        clientSources[index] = source;
        startTimes[index] = context1.currentTime;
    }
}

export async function getAudioDevices(){
    return new Promise((resolve, reject) => {
        var out = [];
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
        if(audioDeviceId){
            if(audioDeviceId !== "default")
                context.setSinkId(audioDeviceId);
        }
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