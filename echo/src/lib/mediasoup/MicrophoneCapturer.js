import AudioAnalyser from '@lib/mediasoup/AudioAnalyser';
const { warn, error, info } = require("@lib/logger");
const { createAudioConstraints } = require("@lib/mediasoup/Constraints");

/**
 * @class MicrophoneCapturer - Class for capturing audio from the microphone
 */
class MicrophoneCapturer {
    constructor(inputDeviceId = 'default', volume = 1.0, muted = false, talkingThreshold = 0.3, noiseSuppression = false, echoCancellation = false, autoGainControl = false) {
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
    async start() {
        return new Promise(async (resolve, reject) => {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia(
                    createAudioConstraints(
                        this.echoCancellation,
                        this.noiseSuppression,
                        this.autoGainControl,
                        this.inputDeviceId
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

    /**
     * Stops capturing audio from the microphone.
     * @returns {void}
    */
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

    /**
     * Set the volume of the microphone
     * @param {float} volume
     * @returns {void}
     */
    setVolume(volume) {
        if (volume >= 0 && volume <= 1) {
            this.volume = volume;
            if(this.outGainNode) {
                this.outGainNode.gain.value = this.volume;
            }
        } else {
            warn("Volume must be between 0 and 1")
        }
    }

    /**
     * Mute the microphone
     * @returns {void}
     */
    mute() {
        this.muted = true;
        if (this.stream) {
            this.stream.getAudioTracks().forEach((track) => {
                track.enabled = false;
            });
        }
    }

    /**
     * Unmute the microphone
     * @returns {void}
     */
    unmute() {
        this.muted = false;
        if (this.stream) {
            this.stream.getAudioTracks().forEach((track) => {
                track.enabled = true;
            });
        }
    }

    /**
     * Change the talking threshold
     * @param {float} threshold
     * @returns Promise that resolves when the talking threshold is set
     */
    setTalkingThreshold(threshold) {
        if (threshold >= 0 && threshold <= 1) {
            this.talkingThreshold = threshold;
            if(this.analyser){
                this.analyser.setTalkingThreshold(this.talkingThreshold);
            }
        } else {
            warn("Talking threshold must be between 0 and 1")
        }
    }

    /**
     * Change the input device
     * @param {string} deviceId
     * @returns Promise that resolves when the input device is set
     */
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
                    resolve(this.start());
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
     * Change the echo cancellation setting
     * @param {boolean} echoCancellation
     * @returns Promise that resolves when the echo cancellation is set
     */
    setEchoCancellation(echoCancellation) {
        return new Promise(async (resolve, reject) => {
            if (echoCancellation === this.echoCancellation) {
                resolve("Echo cancellation is already set to " + echoCancellation);
            }

            this.echoCancellation = echoCancellation;
            if (this.stream) {
                this.stop();
                try {
                    //If stream is started, send new stream
                    resolve(this.start());
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
     * Change the noise suppression setting
     * @param {boolean} noiseSuppression
     * @returns Promise that resolves when the noise suppression is set
     */
    setNoiseSuppression(noiseSuppression) {
        return new Promise(async (resolve, reject) => {
            if (noiseSuppression === this.noiseSuppression) {
                resolve("Noise suppression is already set to " + noiseSuppression);
            }

            this.noiseSuppression = noiseSuppression;
            if (this.stream) {
                this.stop();
                try {
                    //If stream is started, send new stream
                    resolve(this.start());
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
     * Change the auto gain control setting
     * @param {boolean} autoGainControl 
     * @returns Promise that resolves when the auto gain control is set
     */
    setAutoGainControl(autoGainControl) {
        return new Promise(async (resolve, reject) => {
            if (autoGainControl === this.autoGainControl) {
                resolve("Auto gain control is already set to " + autoGainControl);
            }

            this.autoGainControl = autoGainControl;
            if (this.stream) {
                this.stop();
                try {
                    //If stream is started, send new stream
                    resolve(this.start());
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