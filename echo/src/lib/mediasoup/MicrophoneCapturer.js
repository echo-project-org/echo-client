import { createAudioConstraints } from '@lib/mediasoup/constraints.js';
import { AudioAnalyser } from '@lib/mediasoup/Audioanalyser.js';
const { warn, error, info } = require("@lib/logger");

class MicrophoneCapturer {
    constructor(inputDeviceId, volume, muted = false, talkingThreshold = 0.3, noiseSuppression = false, echoCancellation = false, autoGainControl = false) {
        this.muted = muted;
        this.volume = volume;

        this.inputDeviceId = inputDeviceId;
        this.talkingThreshold = talkingThreshold;
        this.noiseSuppression = noiseSuppression;
        this.echoCancellation = echoCancellation;
        this.autoGainControl = autoGainControl;
        this.channelCount = 2;

        this.audioContext = null;
        this.outGainNode = null;
        this.vadNode = null;
        this.channelSplitter = null;
        this.analyser = null;
        this.stream = null;
    }

    /**
     * Starts caputring audio from the microphone.
     * @param {string} inputDeviceId 
     * @returns {Promise<MediaStreamTrack>} Audio track for the microphone.
     */
    async start(inputDeviceId = 'default') {
        return new Promise(async (resolve, reject) => {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia(
                    createAudioConstraints(
                        this.echoCancellation,
                        this.noiseSuppression,
                        this.autoGainControl,
                        inputDeviceId
                    ));

                this.audioContext = new AudioContext();
                const src = this.audioContext.createMediaStreamSource(this.stream);
                const dst = this.audioContext.createMediaStreamDestination();
                this.channelCount = src.channelCount;

                this.outGainNode = this.audioContext.createGain();
                this.vadNode = this.audioContext.createGain();
                this.channelSplitter = this.audioContext.createChannelSplitter(this.channelCount);

                src.connect(this.outGainNode);
                this.outGainNode.connect(this.channelSplitter);
                this.outGainNode.connect(this.vadNode);
                this.vadNode.connect(dst);

                this.analyser = new AudioAnalyser(this.audioContext, this.channelSplitter, this.channelCount, this.talkingThreshold);
                this.analyser.start((v) => {
                    if (v) {
                        this.vadNode.gain.value = 1.0;
                        //TODO emit talking event
                    } else {
                        this.vadNode.gain.value = 0.0;
                        //TODO emit silence event
                    }
                })

                this.setVolume(this.volume);
                if (this.muted) {
                    this.mute();
                }

                resolve(dst.stream.getAudioTracks()[0]);
            } catch (err) {
                reject(err);
            }
        });
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach((track) => {
                track.stop();
            });
            this.stream = null;
        }

        this.audioContext.close();
        this.analyser.stop();
    }

    setVolume(volume) {
        if (volume >= 0 && volume <= 1) {
            this.volume = volume;
            this.outGainNode.gain.value = this.volume;
        } else {
            warn("Volume must be between 0 and 1")
        }
    }

    mute() {
        this.muted = true;
        if (this.stream) {
            this.stream.getAudioTracks().forEach((track) => {
                track.enabled = false;
            });
        }
    }

    unmute() {
        this.muted = false;
        if (this.stream) {
            this.stream.getAudioTracks().forEach((track) => {
                track.enabled = true;
            });
        }
    }

    setTalkingThreshold(threshold) {
        if (threshold >= 0 && threshold <= 1) {
            this.talkingThreshold = threshold;
            this.analyser.setTalkingThreshold(this.talkingThreshold);
        } else {
            warn("Talking threshold must be between 0 and 1")
        }
    }

    setInputDevice(deviceId) {
        return new Promise(async (resolve, reject) => {
            if (deviceId === this.inputDeviceId || deviceId === 'default') {
                reject("Device is already set to " + deviceId);
            }

            this.inputDeviceId = deviceId;
            if (this.stream) {
                this.stop();
                try {
                    //If stream is started, send new stream
                    resolve(this.start(this.inputDeviceId));
                } catch (err) {
                    reject(err);
                }
            } else {
                //If stream is not started, resolve
                resolve(null); 
            }
        });
    }

    setEchoCancellation(echoCancellation) {
        return new Promise(async (resolve, reject) => {
            if (echoCancellation === this.echoCancellation) {
                reject("Echo cancellation is already set to " + echoCancellation);
            }

            this.echoCancellation = echoCancellation;
            if (this.stream) {
                this.stop();
                try {
                    //If stream is started, send new stream
                    resolve(this.start(this.inputDeviceId));
                } catch (err) {
                    reject(err);
                }
            } else {
                //If stream is not started, resolve
                resolve(null);
            }
        });
    }

    setNoiseSuppression(noiseSuppression) {
        return new Promise(async (resolve, reject) => {
            if (noiseSuppression === this.noiseSuppression) {
                reject("Noise suppression is already set to " + noiseSuppression);
            }

            this.noiseSuppression = noiseSuppression;
            if (this.stream) {
                this.stop();
                try {
                    //If stream is started, send new stream
                    resolve(this.start(this.inputDeviceId));
                } catch (err) {
                    reject(err);
                }
            } else {
                //If stream is not started, resolve
                resolve(null);
            }
        });
    }

    setAutoGainControl(autoGainControl) {
        return new Promise(async (resolve, reject) => {
            if (autoGainControl === this.autoGainControl) {
                reject("Auto gain control is already set to " + autoGainControl);
            }

            this.autoGainControl = autoGainControl;
            if (this.stream) {
                this.stop();
                try {
                    //If stream is started, send new stream
                    resolve(this.start(this.inputDeviceId));
                } catch (err) {
                    reject(err);
                }
            } else {
                //If stream is not started, resolve
                resolve(null);
            }
        });
    }

    /**
     * @function getAudioDevices - Gets the audio devices
     * @returns {Promise} - The promise that resolves when the audio devices are found
    */
    static async getInputAudioDevices() {
        //Gets the audio devices
        return new Promise((resolve, reject) => {
            var out = [];
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                devices.forEach((device, id) => {
                    if (device.kind === "audioinput" && device.deviceId !== "communications" && device.deviceId !== "default") {
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
}

export default MicrophoneCapturer;