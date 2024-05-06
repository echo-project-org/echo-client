import { AudioAnalyser } from "@lib/mediasoup/AudioAnalyser";
const { warn, error, info } = require("@lib/logger");

class AudioStreamPlayer {
    /**
     * Creates a new AudioStreamPlayer instance.
     * @param {MediaStreamTrack} track 
     * @param {string} outputDeviceId 
     * @param {float} volume 
     * @param {float} personalVolume 
     * @param {boolean} deaf 
     */
    constructor(track, outputDeviceId, volume = 1.0, personalVolume = 1.0, deaf = false) {
        this.volume = volume;
        this.personalVolume = personalVolume;
        this.deaf = deaf;
        this.outputDeviceId = outputDeviceId;

        this.track = track;
        this.stream = new MediaStream([this.track]);
        this.audioContext = new AudioContext();
        this.source = this.audioContext.createMediaStreamSource(this.stream);

        if (this.outputDeviceId !== 'default' && this.outputDeviceId !== 'communications') {
            this.audioContext.outputDeviceId(this.outputDeviceId);
        }

        this.personalGainNode = this.audioContext.createGain();
        this.gainNode = this.audioContext.createGain();
        this.deafNode = this.audioContext.createGain();

        this.channelSplitter = this.audioContext.createChannelSplitter(this.source.channelCount);

        this.source.connect(this.personalGainNode);
        this.personalGainNode.connect(this.gainNode);
        this.gainNode.connect(this.deafNode);
        this.deafNode.connect(this.channelSplitter);
        this.deafNode.connect(this.audioContext.destination);

        this.personalGainNode.gain.value = this.personalVolume;
        this.gainNode.gain.value = this.volume;
        this.deafNode.gain.value = this.deaf ? 0 : 1;
        this.gainNode.connect(this.audioContext.destination);

        this.audioContext.resume();

        this.analyser = new AudioAnalyser(this.stream, this.audioContext, this.channelSplitter, this.source.channelCount);

        // Chrome but fix
        this.audioElement = new Audio();
        this.audioElement.srcObject = this.stream;
        this.audioElement.autoplay = true;
        this.audioElement.pause();
    }

    /**
     * Starts the audio player.
     */
    start() {
        if (this.analyser) {
            this.analyser.start((v) => {
                if (v) {
                    // Someone started talking
                } else {
                    // Someone stopped talking
                }
            });
        } else {
            warn('AudioAnalyser not initialized');
        }
    }

    /**
     * Stops the audio player.
     */
    stop() {
        if (this.analyser) {
            this.analyser.stop();
        }
    }

    /**
     * Sets the volume for the player.
     * @param {float} volume 
     */
    setVolume(volume) {
        this.volume = volume;
        this.gainNode.gain.value = volume;
    }

    /**
     * Sets the personal volume for the player.
     * @param {float} volume 
     */
    setPersonalVolume(volume) {
        this.personalVolume = volume;
        this.personalGainNode.gain.value = volume;
    }

    /**
     * Sets the deaf state of the player.
     * @param {boolean} deaf 
     */
    setDeaf(deaf) {
        this.deaf = deaf;
        this.deafNode.gain.value = deaf ? 0 : 1;
    }

    /**
     * Sets the defautl device for the audio context.
     * @param {string} deviceId 
     */
    setOutputDevice(deviceId) {
        if (deviceId !== 'default' && deviceId !== 'communications') {
            this.audioContext.outputDeviceId(deviceId);
        } else {
            // This doesn't really work well but it should never happen.
            // Default is not a valid device, it errors out and then sets the default device.
            this.audioContext.outputDeviceId('default');
        }
    }

    /**
     * @function getAudioDevices - Gets the audio devices
     * @returns {Promise} - The promise that resolves when the audio devices are found
    */
    static async getOutputAudioDevices() {
        return new Promise((resolve, reject) => {
            var out = [];
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                devices.forEach((device, id) => {
                    if (device.kind === "audiooutput" && device.deviceId !== "communications" && device.deviceId !== "default") {
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

export default AudioStreamPlayer;