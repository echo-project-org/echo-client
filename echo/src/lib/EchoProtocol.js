import MediasoupHandler from '@lib/mediasoup/MediasoupHandler';
import { storage, ee } from "@root/index";
const { info, error, log } = require('@lib/logger');
const api = require('@lib/api');

class EchoProtocol {
    constructor() {
        this.msh = new MediasoupHandler(
            storage.get("inputAudioDeviceId"),
            storage.get("outputAudioDeviceId"),
        );
    }

    isAudioFullyConnected() {
        return this.msh.isFullyConnected();
    }

    joinRoom(roomId) {
        console.log(roomId)
        api.call("rooms/join", "POST", { id: sessionStorage.getItem("id"), roomId: roomId, serverId: storage.get("serverId") })
        .then((res) => {
            let r = res.json;
            log("Joined room", r);
            this.joinedRoom(r.data);
            this.produceAudio();
            ee.joinedRoom();
        }).catch((err) => {
            error("Error joining room", err);
        });
    }

    joinedRoom(data) {
        return new Promise(async (resolve, reject) => {
            //Server has created the tranport now I need to do the same with given data
            let rc = data.routerCapabilities;
            let t = data.transports;
            try {
                await this.msh.createTransport("audioOut", rc, t.audioOut)
                await this.msh.createTransport("audioIn", rc, t.audioIn)
                await this.msh.createTransport("videoOut", rc, t.videoOut)
                await this.msh.createTransport("videoIn", rc, t.videoIn)
                resolve(true);
            } catch (err) {
                error("Error creating transports", err);
                reject(err);
            }
        });
    }

    produceAudio() {
        this.msh.startAudioBroadcast()
            .then((ap) => {
                log("Started audio broadcast", ap);
            }).catch((err) => {
                error("Error starting audio broadcast", err);
            });
    }

    exitRoom() {
        api.call("rooms/join", "POST", { userId: storage.get("id"), roomId: "0", serverId: storage.get("serverId") })
        .then((res) => {
            log("Left room", res);
            ee.exitedFromRoom();
        }).catch((err) => {
            error("Error leaving room", err);
        });
    }

    getPing() {
        return new Promise((resolve, reject) => {
            this.msh.getConnectionStats().then((stats) => {
                console.log(stats.ping)
                resolve(stats.ping);
            }).catch((err) => {
                error("[EchoProtocol] Error getting ping", err)
                reject(err);
            });
        })
    }

    closeConnection() {
        this.exitRoom();
        this.msh.closeConnection();
    }

    setMicrophoneVolume(volume) {
        this.msh.setMicrophoneVolume(volume);
    }

    setMicrophoneDevice(deviceId) {
        this.msh.setMicrophoneDevice(deviceId);
    }

    toggleMute(mute) {
        this.msh.toggleMute(mute);
    }

    setVadTreshold(treshold) {
        this.msh.setVadTreshold(treshold);
    }

    setEchoCancellation(echoCancellation) {
        this.msh.setEchoCancellation(echoCancellation);
    }

    setNoiseSuppression(noiseSuppression) {
        this.msh.setNoiseSuppression(noiseSuppression);
    }

    setAutoGainControl(autoGainControl) {
        this.msh.setAutoGainControl(autoGainControl);
    }

    setSpeakerVolume(volume) {
        this.msh.setSpeakerVolume(volume);
    }

    setSpeakerDevice(deviceId) {
        this.msh.setSpeakerDevice(deviceId);
    }

    toggleDeaf(deaf) {
        this.msh.toggleDeaf(deaf);
    }

    startReceivingVideo(userId) {

    }

    stopReceivingVideo(userId) {

    }
}

export default EchoProtocol;