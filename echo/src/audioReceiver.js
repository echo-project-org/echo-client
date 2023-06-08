let audioContexts = [];
let clientSources = [];
let startTimes = [];
let audioDeviceId = localStorage.getItem('outputAudioDeviceId')
let mainOutVoume = localStorage.getItem('mainOutVolume')
var id = localStorage.getItem('id');
let userVolumes = [];

let clientIds = [];
let peers = [];

export async function syncAudio() {
    clientIds.forEach((id) => {
        let index = clientIds.indexOf(id);
        audioDeviceId = localStorage.getItem('outputAudioDeviceId')
        mainOutVoume = localStorage.getItem('mainOutVolume')

        var context1 = new AudioContext();
        if (audioDeviceId) {
            if (audioDeviceId !== "default")
                context1.setSinkId(audioDeviceId);
        }

        let source = context1.createBufferSource()
        let gainNode = context1.createGain();

        if (mainOutVoume) {
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
    if (clientIds.includes('' + uId)) {
        let index = clientIds.indexOf('' + uId);
        userVolumes[index] = volume;
    }
}

function createPeer(senderId) {
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer, senderId);

    return peer;
}

function handleTrackEvent(e) {
    //document.getElementById("video").srcObject = e.streams[0];
};

async function handleNegotiationNeededEvent(peer, senderId) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const body = {
        sdp: peer.localDescription,
        senderId: senderId,
        receiverId: id,
    };

    fetch('http://localhost:6983/subscribeAudio', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    }).then((response) => {
        response.json().then((json) => {
            const desc = new RTCSessionDescription(json.sdp);
            peer.setRemoteDescription(desc).catch(e => console.log(e));
        })
    });
}

export function subscribeToAudioStream(senderId) {
    clientIds.push(senderId);
    const peer = createPeer(senderId);
    peer.addTransceiver("audio", { direction: "recvonly" })

    if (clientIds.includes(senderId)) {
        let index = clientIds.indexOf(senderId);
        peers[index] = peer;
    } else {
        peers.push(peer);
    }
}

export function setAudioVolume(volume) {
    localStorage.setItem('mainOutVolume', volume);
    mainOutVoume = volume;
}

export function setAudioDevice(device) {
    audioDeviceId = device;
}

export async function startOutputAudioStream(clientId) {
    console.log("Creating audio out")
    audioDeviceId = localStorage.getItem('outputAudioDeviceId')
    mainOutVoume = localStorage.getItem('mainOutVolume')

    if (!clientIds.includes(clientId)) {
        var context = new AudioContext();
        if (audioDeviceId) {
            if (audioDeviceId !== "default")
                context.setSinkId(audioDeviceId);
        }
        let source = context.createBufferSource()
        let gainNode = context.createGain();

        if (mainOutVoume) {
            gainNode.gain.value = mainOutVoume;
        }
        gainNode.connect(context.destination);
        source.connect(gainNode);

        clientIds.push(clientId);
        audioContexts.push(context);
        clientSources.push(source);
        userVolumes.push(1)
        startTimes.push(context.currentTime);

        syncAudio()
    } else {
        let index = clientIds.indexOf(clientId);
        if (audioDeviceId) {
            if (audioDeviceId !== "default")
                context.setSinkId(audioDeviceId);
        }
        var context1 = new AudioContext();
        let source = context1.createBufferSource()
        let gainNode = context1.createGain();
        let personalGain = context1.createGain();

        if (mainOutVoume) {
            gainNode.gain.value = mainOutVoume;
        }
        gainNode.connect(context1.destination);
        source.connect(personalGain);
        personalGain.connect(gainNode)

        audioContexts[index] = context1;
        clientSources[index] = source;
        startTimes[index] = context1.currentTime;

        syncAudio()
    }
}

export async function getAudioDevices() {
    return new Promise((resolve, reject) => {
        var out = [];
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            devices.forEach((device, id) => {
                if (device.kind === "audiooutput") {
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

export async function stopOutputAudioStream(id = null) {
    if (id) {
        if (clientIds.includes(id)) {
            let index = clientIds.indexOf(id);
            audioContexts[index].close();
            audioContexts.splice(index, 1);
            clientSources.splice(index, 1);
            clientIds.splice(index, 1);
            startTimes.splice(index, 1);
            userVolumes.splice(index, 1);
        }
    } else {
        audioContexts.forEach(e => { e.close(); });

        audioContexts = [];
        clientSources = [];
        clientIds = [];
        startTimes = [];
        userVolumes = [];
    }
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
        if (audioDeviceId) {
            if (audioDeviceId !== "default")
                context.setSinkId(audioDeviceId);
        }
        let audioBuffer = context.createBuffer(2, 4096, 48000);

        audioBuffer.getChannelData(0).set(left);
        audioBuffer.getChannelData(1).set(right);


        source = context.createBufferSource()
        let gainNode = context.createGain();
        let personalGain = context.createGain();

        if (mainOutVoume) {
            gainNode.gain.value = mainOutVoume;
        }

        if (userVolumes[index]) {
            personalGain.gain.value = userVolumes[index];
        }

        source.buffer = audioBuffer
        source.connect(personalGain);
        personalGain.connect(gainNode);
        gainNode.connect(context.destination);

        if (startTimes[index] === 0) startTimes[index] = context.currentTime + (audioBuffer.length / audioBuffer.sampleRate) / 2;
        source.start(startTimes[index]);
        startTimes[index] += audioBuffer.length / audioBuffer.sampleRate;
    }
}