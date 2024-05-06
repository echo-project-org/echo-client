import { createVideoConstraints } from '@lib/mediasoup/constraints.js';
const { warn, error, info } = require("@lib/logger");
const { ipcRenderer } = require('electron');

class ScreenCapturer {
    constructor(videoSourceId, frameRate = 60, width = 1920, height = 1080, cursor = true) {
        this.videoSourceId = videoSourceId;
        this.frameRate = frameRate;
        this.width = width;
        this.height = height;
        this.cursor = cursor;

        this.stream = null;
    }

    start() {
        return new Promise(async (resolve, reject) => {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia(
                    createVideoConstraints(this.videoSourceId, {w: this.width, h: this.height}, this.frameRate, this.cursor)
                );

                resolve({
                    video: this.stream.getVideoTracks()[0],
                    audio: this.stream.getAudioTracks()[0]
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }


    /**
     * Retrieves the available video sources and filters out those with invalid thumbnail sizes.
     * @returns {Promise<Array<Object>>} An array of video sources with valid thumbnail sizes.
     */
    static async getVideoSources() {
        try {
            const srcs = await ipcRenderer.invoke("getVideoSources");
            return srcs.filter((src) => {
                return (src.thumbnail.getSize().width > 0 && src.thumbnail.getSize().height > 0);
            });
        } catch (err) {
            return [];
        }
    }
}

export default ScreenCapturer;