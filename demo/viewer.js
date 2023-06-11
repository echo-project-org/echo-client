const audioElement = new Audio();


window.onload = () => {
    document.getElementById('my-button').onclick = () => {
        init();
    }
}

async function init() {
    const peer = createPeer();
    peer.addTransceiver("audio", { direction: "recvonly" })
}

function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                "urls": ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]
            }
        ]
    });
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
}

async function handleNegotiationNeededEvent(peer) {
    console.log(peer);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const body = {
        sdp: peer.localDescription,
        senderId: "1",
        receiverId: "2"
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
            console.log("remote desc", desc)
            peer.setRemoteDescription(desc).then(e => console.log(e)).catch(e => console.log(e));
        }
    )});
}

function handleTrackEvent(e) {
    // get headphones audio using getUserMedia
    navigator.mediaDevices.getUserMedia({
        audio: {
            channelCount: 2,
            sampleRate: 48000,
            sampleSize: 16,
            volume: 1,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            deviceId: 2,
        }
    }).then((stream) => {
        const audioTracks = stream.getAudioTracks();
        console.log(audioTracks)
        // console.log('Got stream with constraints:', constraints);
        console.log(`Using audio device: ${audioTracks[0].label}`);
        stream.oninactive = function() {
            console.log('Stream inactive');
        };
        window.stream = stream; // make variable available to browser console
        window.stream.addTrack(e.track);
        // audioElement.srcObject = stream;
        // audioElement.play();
    }).catch((error) => {
        console.error('Error accessing microphone:', error);
    });

    // console.log(e);
    // console.log("handling track event")
    // audioElement.srcObject = e.streams[0];
    // audioElement.play();
};
