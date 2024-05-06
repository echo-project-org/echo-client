const { warn, error, info } = require("@lib/logger");

const ANALYZE_INTERVAL = 20;
const DEFAULT_TALKING_THRESHOLD = 0.3; // Default for remote users

/**
 * Class representing an audio analyser.
 * @class
 * @classdesc
 * The AudioAnalyser class is used to analyse audio streams for talking status.
 */
class AudioAnalyser {
    /**
     * Creates a new AudioAnalyser instance.
     * @param {MediaStream} stream - The media stream to analyse.
     * @param {AudioContext} context - The audio context to use for analysis.
     * @param {ChannelSplitterNode} splitter - The channel splitter node to use for analysis.
     * @param {number} channelCount - The number of audio channels to analyse.
     * @param {number} talkingThreshold - The talking threshold to use for analysis.
     * @returns {AudioAnalyser} The new AudioAnalyser instance.
    */ 
    constructor(stream, context, splitter, channelCount = 2, talkingThreshold = DEFAULT_TALKING_THRESHOLD) {
        this.analyser = {};
        this.freqs = {};
        this.stream = stream;
        this.context = context;
        this.splitter = splitter;
        this.channelCount = channelCount;
        this.talkingThreshold = talkingThreshold;

        this.interval = null;
        this.hasSpoken = false;

        for (let i = 0; i < this.channelCount; i++) {
            this.analyser[i] = this.context.createAnalyser();

            // for human voice
            // https://github.com/Jam3/voice-activity-detection/blob/master/index.js

            this.analyser[i].fftSize = 1024;
            this.analyser[i].bufferLen = 1024;
            this.analyser[i].smoothingTimeConstant = 0.8;
            this.analyser[i].minCaptureFreq = 85;
            this.analyser[i].maxCaptureFreq = 255;
            this.analyser[i].noiseCaptureDuration = 1000;
            this.analyser[i].minNoiseLevel = 0.1;
            this.analyser[i].maxNoiseLevel = 0.5;
            this.analyser[i].avgNoiseMultiplier = 1.0;

            // analyser[i].minDecibels = -100;
            // analyser[i].maxDecibels = 0;
            this.freqs[i] = new Uint8Array(this.analyser[i].frequencyBinCount);
            this.splitter.connect(this.analyser[i], i, 0);
        }
    }

    /**
     * Sets the talking threshold.
     * @param {number} talkingThreshold - The talking threshold to set.
     * @returns {void}
     */
    setTalkingThreshold(talkingThreshold) {
        if (talkingThreshold >= 0 && talkingThreshold <= 1) {
            this.talkingThreshold = talkingThreshold;
        } else {
            error('Talking threshold must be between 0 and 1, setting to default');
            this.talkingThreshold = DEFAULT_TALKING_THRESHOLD;
        }
    }

    /**
     * Calculates the audio levels for the given analyser, frequency data and channel count.
     * @param {AnalyserNode[]} analyser - The analyser nodes to use for calculating audio levels.
     * @param {Uint8Array[]} freqs - The frequency data arrays to use for calculating audio levels.
     * @param {number} channelCount - The number of audio channels to calculate levels for.
     * @returns {number[]} An array of audio levels, one for each channel.
    */
    _calculateAudioLevels() {
        const audioLevels = [];
        for (let i = 0; i < this.channelCount; i++) {
            this.analyser[i].getByteFrequencyData(this.freqs[i]);
            let value = 0;
            for (let j = 0; j < this.analyser[i].frequencyBinCount; j++) {
                value += Math.max(value, this.freqs[i][j]);
            }

            audioLevels[i] = value / 256;
        }

        return audioLevels;
    }

    /**
     * Rounds a number to one decimal place.
     * @param {number} num - The number to round.
     * @returns {number} The rounded number.
    */
    _round(num) {
        return Math.round((num + Number.EPSILON) * 10) / 10;
    }

    /**
     * Starts the stats interval to calculate audio levels for the stream.
     * @param {Function} cb - The callback to call when talking status changes.
     * @returns {void}
    */
    start(cb) {
        if (this.interval) {
            warn('Audio analyser interval already running, restarting...')
            this.stop();
        }

        this.interval = setInterval(() => {
            if (!this.stream.active) {
                warn('Stream is not active');
            }
            if (!cb) {
                error('No callback provided, stopping audio analyser interval');
                this.stop();
                return;
            }

            let audioLevel = this._calculateAudioLevels();
            if (!this.hasSpoken && this._round(audioLevel.reduce((a, b) => a + b, 0) / 2) >= this.talkingThreshold) {
                this.hasSpoken = true;
                cb(true);
            } else if (this.hasSpoken && this._round(audioLevel.reduce((a, b) => a + b, 0) / 2) < this.talkingThreshold) {
                this.hasSpoken = false;
                cb(false);
            }
        }, ANALYZE_INTERVAL);
    }

    /**
     * Stops the stats interval.
     * @returns {void}
    */
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

export default AudioAnalyser;