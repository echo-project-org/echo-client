let audioContexts = [];
let clientSources = [];
let clientIds = [];
let startTimes = [];
let audioDeviceId = localStorage.getItem('outputAudioDeviceId')
let mainOutVoume = localStorage.getItem('mainOutVolume')
let userVolumes = [];

export async function syncAudio(){
    clientIds.forEach((id) => {
        let index = clientIds.indexOf(id);
        audioDeviceId = localStorage.getItem('outputAudioDeviceId')
        mainOutVoume = localStorage.getItem('mainOutVolume')

        var context1 = new AudioContext();
        if(audioDeviceId){
            if(audioDeviceId !== "default")
                context1.setSinkId(audioDeviceId);
        }

        let source = context1.createBufferSource()
        let gainNode = context1.createGain();

        if(mainOutVoume){
            gainNode.gain.value = mainOutVoume;
        }
        gainNode.connect(context1.destination);
        source.connect(gainNode);

        audioContexts[index] = context1;
        clientSources[index] = source;
        startTimes[index] = context1.currentTime;
    })
}

export function setUserAudioVolume(volume, uId) {
    userVolumes.forEach((vol) => {
        if(volume.id === uId){
            vol.volume = volume;
            return;
        }
    })

    userVolumes.push({'id': uId, 'volume': volume})
    localStorage.setItem('userVolumes', userVolumes);
}

export function setAudioVolume(volume) {
    localStorage.setItem('mainOutVolume', volume);
    mainOutVoume = volume;
}

export function setAudioDevice(device) {
    localStorage.setItem('outputAudioDeviceId', device);
    audioDeviceId = device;
}

export async function startOutputAudioStream(clientId) {
    console.log("Creating audio out")
    audioDeviceId = localStorage.getItem('outputAudioDeviceId')
    mainOutVoume = localStorage.getItem('mainOutVolume')

    if (!clientIds.includes(clientId)) {
        var context = new AudioContext();
        if(audioDeviceId){
            if(audioDeviceId !== "default")
                context.setSinkId(audioDeviceId);
        }
        let source = context.createBufferSource()
        let gainNode = context.createGain();

        if(mainOutVoume){
            gainNode.gain.value = mainOutVoume;
        }
        gainNode.connect(context.destination);
        source.connect(gainNode);

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
        let gainNode = context1.createGain();

        if(mainOutVoume){
            gainNode.gain.value = mainOutVoume;
        }
        gainNode.connect(context1.destination);
        source.connect(gainNode);

        audioContexts[index] = context1;
        clientSources[index] = source;
        startTimes[index] = context1.currentTime;

        syncAudio()
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
        let gainNode = context.createGain();

        if(mainOutVoume){
            gainNode.gain.value = mainOutVoume;
        }
        gainNode.connect(context.destination);
        source.buffer = audioBuffer
        source.connect(gainNode);

        if(startTimes[index] === 0) startTimes[index] = context.currentTime + (audioBuffer.length / audioBuffer.sampleRate)/2;
        source.start(startTimes[index]);
        startTimes[index] += audioBuffer.length / audioBuffer.sampleRate;
    }
}