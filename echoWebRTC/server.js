const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const webrtc = require('wrtc');
const sdpTransform = require('sdp-transform');

const stunkStunkServer = [
    "stun:kury.ddns.net:6984"
];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    console.log('Got api request:', Date.now(), "Query:", req.url, "Method:", req.method);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET");
    next();
});


let senderStreams = [];
let senders = [];

let audioUsers = [];
let audioStreams = [];
let inPeers = [];

let audioListeners = [];
let outPeers = [];

app.post('/consumer', async (req, res) => {
    const { sdp, senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
        return res.status(400).json({ message: "Provide a valid sender and receiver id" });
    }

    //if senderId is not in senders
    if (!senders.includes(senderId)) {
        return res.status(404).json({ message: "Stream not found" });
    }

    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: stunkStunkServer
            }
        ]
    });

    const desc = new webrtc.RTCSessionDescription(sdp);
    await peer.setRemoteDescription(desc);
    //get index of senderId
    const index = senders.indexOf(senderId);
    console.log("User " + receiverId + " connected to user " + senderId + "'s stream");
    senderStreams[index].getTracks().forEach(track => peer.addTrack(track, senderStreams[index]));

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    const payload = {
        sdp: peer.localDescription
    }

    res.json(payload);
});

app.post('/broadcast', async (req, res) => {
    const { sdp, id } = req.body;
    if (!id) {
        return res.status(400).json({ message: "Provide a valid id" });
    }

    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: stunkStunkServer
            }
        ]
    });

    peer.ontrack = (e) => {handleTrackEvent(e, peer, id)};
    const desc = new webrtc.RTCSessionDescription(sdp);
    await peer.setRemoteDescription(desc);

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    const payload = {
        sdp: peer.localDescription
    }

    res.json(payload);
});

function handleTrackEvent(e, peer, id) {
    console.log("User " + id + " is broadcasting their stream")
    //if id is not in senders, add it
    if (!senders.includes(id)) {
        senders.push(id);
        senderStreams.push(e.streams[0]);
    } else {
        //if id is in senders, replace the stream
        const index = audioUsers.indexOf(id);
        audioUsers[index].stop();
        audioStreams[index] = e.streams[0];
    }
}

app.post('/subscribeAudio', async (req, res) => {
    let { sdp, senderId, receiverId } = req.body;
    receiver = String(receiverId)
    senderId = String(senderId)

    if (!senderId || !receiverId) {
        return res.status(400).json({ message: "Provide a valid sender and receiver id" });
    }

    //if audioUsers is not in senders
    if (!audioUsers.includes(senderId)) {
        return res.status(404).json({ message: "Stream not found" });
    }

    if (audioListeners.includes(receiverId)) {
        let index = audioListeners.indexOf(receiverId);
        if(outPeers[index]){
            outPeers[index].close();
            outPeers[index] = null;
        }
    } else{
        audioListeners.push(receiverId);
        outPeers.push(null);
    }

    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: stunkStunkServer
            }
        ]
    });

    const desc = new webrtc.RTCSessionDescription(sdp);
    await peer.setRemoteDescription(desc);
    //get index of senderId
    const index = audioUsers.indexOf(senderId);
    console.log("User " + receiverId + " connected to user " + senderId + "'s audio stream");
    audioStreams[index].getTracks().forEach(track => peer.addTrack(track, audioStreams[index]));

    const answer = await peer.createAnswer();
    let parsed = sdpTransform.parse(answer.sdp);
    parsed.media[0].fmtp[0].config = "minptime=10;useinbandfec=1;maxplaybackrate=48000;stereo=1;maxaveragebitrate=510000";
    answer.sdp = sdpTransform.write(parsed);
    await peer.setLocalDescription(answer);

    const payload = {
        sdp: peer.localDescription
    }

    let listenerIndex = audioListeners.indexOf(receiverId);
    outPeers[listenerIndex] = peer;

    res.json(payload);
});

function handleAudioTrackEvent(e, peer, id) {
    id = String(id);
    //if id not in audioUsers, add it
    if (!audioUsers.includes(id)) {
        console.log("User " + id + " is broadcasting audio");
        audioUsers.push(id);
        audioStreams.push(e.streams[0]);
    } else {
        //if id is in audioUsers, replace the stream
        console.log("User " + id + " is broadcasting audio again");

        const index = audioUsers.indexOf(id);
        audioStreams[index] = e.streams[0];
    }
}

app.post('/broadcastAudio', async (req, res) => {
    let { sdp, id } = req.body;
    id = String(id);

    if (!id) {
        return res.status(400).json({ message: "Provide a valid id" });
    }


    const peer = new webrtc.RTCPeerConnection({
        iceServers: [
            {
                urls: stunkStunkServer
            }
        ]
    });
    peer.ontrack = (e) => {handleAudioTrackEvent(e, peer, id)};
    const desc = new webrtc.RTCSessionDescription(sdp);
    await peer.setRemoteDescription(desc);

    const answer = await peer.createAnswer();
    let parsed = sdpTransform.parse(answer.sdp);
    parsed.media[0].fmtp[0].config = "minptime=10;useinbandfec=1;maxplaybackrate=48000;stereo=1;maxaveragebitrate=510000";
    answer.sdp = sdpTransform.write(parsed);

    await peer.setLocalDescription(answer);

    const payload = {
        sdp: peer.localDescription
    }

    if (audioUsers.includes(id)) {
        const index = audioUsers.indexOf(id);
        inPeers[index] = peer;
    } else {
        inPeers.push(peer);
    }

    res.json(payload);
});
app.post('/stopAudioBroadcast', async (req, res) => {
    let { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: "Provide a valid id" });
    }

    id = String(id);

    if (audioUsers.includes(id)) {
        const index = audioUsers.indexOf(id);
        audioStreams[index].getTracks().forEach(track => track.stop());
        audioStreams[index] = null;
        inPeers[index].close();
        inPeers[index] = null;

        audioUsers.splice(index, 1);
        audioStreams.splice(index, 1);
        inPeers.splice(index, 1);
    }

    return res.status(200).json({ message: "Broadcast stopped" });
});

app.listen(6983, () => { console.log('Server started') });