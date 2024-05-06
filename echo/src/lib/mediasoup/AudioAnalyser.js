class AudioAnalyser {
    constructor(context, splitter, channelCount = 2) {
        this.analyser = {};
        this.freqs = {};
        this.context = context;
        this.splitter = splitter;
        this.channelCount = channelCount;

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
}

export default AudioAnalyser;