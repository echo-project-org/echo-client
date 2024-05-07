import MediasoupHandler from '@lib/mediasoup/MediasoupHandler';
import { storage } from "@root/index";
const { info, error, log } = require('@lib/logger');

class EchoProtocol {
    constructor() {
        this.msh = new MediasoupHandler(
            storage.get("inputAudioDeviceId"),
            storage.get("outputAudioDeviceId"),
        );
    }

    joinRoom() {
        
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
}

export default EchoProtocol;