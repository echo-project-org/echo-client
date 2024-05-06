class AudioStreamPlayer {
    constructor(track, outputDeviceId, volume = 1.0, personalVolume = 1.0, deaf = false) {
        this.track = track;
        this.volume = volume;
        this.stream = new MediaStream([track]);
        this.audioContext = new AudioContext();
        this.source = this.audioContext.createMediaStreamSource(this.stream);

        if (outputDeviceId !== 'default' && outputDeviceId !== 'communications') {
            this.audioContext.outputDeviceId(outputDeviceId);
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

        this.personalGainNode.gain.value = personalVolume;
        this.gainNode.gain.value = volume;
        this.deafNode.gain.value = deaf ? 0 : 1;
        this.gainNode.connect(this.audioContext.destination);

        this.audioContext.resume();

        // Chrome but fix
        this.audioElement = new Audio();
        this.audioElement.srcObject = this.stream;
        this.audioElement.autoplay = true;
        this.audioElement.pause();
    }
}

export default AudioStreamPlayer;