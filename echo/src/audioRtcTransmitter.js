import { ep } from "./index";
const mediasoup = require("mediasoup-client");

const ICE_SERVERS = [{
  username: 'echo',
  credential: 'echo123',
  urls: ["turn:turn.kuricki.com:6984"]
}];

class audioRtcTransmitter {
  constructor(id, inputDeviceId = 'default', outputDeviceId = 'default', volume = 1.0) {
    this.id = id;
    this.inputDeviceId = inputDeviceId;
    this.outputDeviceId = outputDeviceId;
    this.volume = volume;
    this.mediasoupDevice = null;
    this.sendTransport = null;
    this.producer = null;
    this.outChannelCount = 2;

    this.isMuted = false;
    this.context = null;
    this.outStream = null;
    this.outGainNode = null;
    this.vadNode = null;


    this.analyser = null;
    this.talkingThreashold = 0.2;
    this.statsInterval = null;
    this.inputLevel = 0;
    this.outputLevel = 0;

    this.constraints = {
      audio: {
        channelCount: 2,
        sampleRate: 48000,
        sampleSize: 16,
        volume: 1.0,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        deviceId: this.deviceId,
        googNoiseSupression: false,
      },
      video: false,
    }
  }

  async createSendTransport(data) {
    console.log("Creating send transport", data);
    if (!this.mediasoupDevice.loaded) {
      await this.mediasoupDevice.load({ routerRtpCapabilities: data.rtpCapabilities });
    }
    this.sendTransport = this.mediasoupDevice.createSendTransport({
      id: data.id,
      iceParameters: data.iceParameters,
      iceCandidates: data.iceCandidates,
      dtlsParameters: data.dtlsParameters,
      sctpParameters: data.sctpParameters,
      iceServers: data.iceServers,
      iceTransportPolicy: data.iceTransportPolicy,
      additionalSettings: data.additionalSettings,
    });

    this.sendTransport.on("connectionstatechange", () => {
      ep.rtcConnectionStateChange({
        state: this.sendTransport.connectionState,
      })
    });

    this.sendTransport.on("connect", async ({ dtlsParameters }, cb, errback) => {
      console.log("Send transport connect");
      ep.sendTransportConnect({ dtlsParameters }, cb, errback);
    });

    this.sendTransport.on("produce", async ({ kind, rtpParameters, appData }, callback, errback) => {
      console.log("Send transport produce");
      ep.sendTransportProduce({
        kind,
        rtpParameters,
        appData,
      }, callback, errback);
    });

    this.startAudioBroadcast();
  }

  async init() {
    this.mediasoupDevice = new mediasoup.Device();
  }

  async startAudioBroadcast() {
    console.log("Starting audio broadcast");
    if (!this.mediasoupDevice.canProduce("audio")) {
      console.error("Cannot produce audio");
      return;
    }

    this.outStream = await navigator.mediaDevices.getUserMedia(this.constraints, err => { console.error(err); return; });
    const context = new AudioContext();

    const src = context.createMediaStreamSource(this.outStream);
    const dst = context.createMediaStreamDestination();
    this.outChannelCount = src.channelCount;

    this.outGainNode = context.createGain();
    this.vadNode = context.createGain();
    this.channelSplitter = context.createChannelSplitter(this.outChannelCount);

    src.connect(this.outGainNode);
    this.outGainNode.connect(this.channelSplitter);
    this.outGainNode.connect(this.vadNode);
    this.vadNode.connect(dst);

    this.analyser = this.createAudioAnalyser(context, this.channelSplitter, this.outChannelCount);

    this.setOutVolume(this.volume);

    console.log(dst.stream.getAudioTracks());
    const audioTrack = dst.stream.getAudioTracks()[0];
    this.producer = await this.sendTransport.produce({
      track: audioTrack,
      codecOptions: {
        opusStereo: true,
        opusDtx: true,
      },
    });
  }

  createAudioAnalyser(context, splitter, channelCount) {
    const analyser = {};
    const freqs = {};
    for (let i = 0; i < channelCount; i++) {
      analyser[i] = context.createAnalyser();

      // for human voice
      // https://github.com/Jam3/voice-activity-detection/blob/master/index.js

      analyser[i].fftSize = 1024;
      analyser[i].bufferLen = 1024;
      analyser[i].smoothingTimeConstant = 0.2;
      analyser[i].minCaptureFreq = 85;
      analyser[i].maxCaptureFreq = 255;
      analyser[i].noiseCaptureDuration = 1000;
      analyser[i].minNoiseLevel = 0.3;
      analyser[i].maxNoiseLevel = 0.7;
      analyser[i].avgNoiseMultiplier = 1.2;

      // analyser[i].minDecibels = -100;
      // analyser[i].maxDecibels = 0;
      freqs[i] = new Uint8Array(analyser[i].frequencyBinCount);
      splitter.connect(analyser[i], i, 0);
    }

    return {
      analyser: analyser,
      freqs: freqs,
    }
  }

  calculateAudioLevels(analyser, freqs, channelCount) {
    const audioLevels = [];
    for (let channelI = 0; channelI < channelCount; channelI++) {
      analyser[channelI].getByteFrequencyData(freqs[channelI]);
      let value = 0;
      for (let freqBinI = 0; freqBinI < analyser[channelI].frequencyBinCount; freqBinI++) {
        value = Math.max(value, freqs[channelI][freqBinI]);
      }
      audioLevels[channelI] = value / 256;
    }
    return audioLevels;
  }

  _round(num) {
    return Math.round((num + Number.EPSILON) * 10) / 10;
  }

  setVoiceDetectionVolume(volume) {
    if (volume > 1.0 || volume < 0.0) {
      console.error("Volume must be between 0.0 and 1.0", volume);
      volume = 1.0;
    }

    //cancel previous time change
    this.vadNode.gain.cancelAndHoldAtTime(0);
    //ramp volume to new value in 1 second
    this.vadNode.gain.linearRampToValueAtTime(volume, 1);
  }

  startStatsInterval() {
    console.log(this.id, "starting stats interval")
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }

    this.statsInterval = setInterval(() => {
      // remote user's audio levels
      if (this.inputStreams) {
        this.inputStreams.forEach((stream) => {
          let audioInputLevels = this.calculateAudioLevels(stream.analyser.analyser, stream.analyser.freqs, stream.source.channelCount);
          if (!this.hasSpoken && this._round(audioInputLevels.reduce((a, b) => a + b, 0) / 2) >= this.talkingThreashold) {
            this.hasSpoken = true;
            ep.audioStatsUpdate({
              id: this._findUserId(stream),
              talking: this.hasSpoken,
            });
          } else if (this.hasSpoken && this._round(audioInputLevels.reduce((a, b) => a + b, 0) / 2) < this.talkingThreashold) {
            this.hasSpoken = false;
            ep.audioStatsUpdate({
              id: this._findUserId(stream),
              talking: this.hasSpoken,
            });
          }
        });
      }

      // local user's audio levels
      if (this.analyser) {
        let audioOutputLevels = this.calculateAudioLevels(this.analyser.analyser, this.analyser.freqs, this.outputChannelCount);
        // console.log("audioOutputLevels", audioOutputLevels, this._round(audioOutputLevels.reduce((a, b) => a + b, 0) / 2))
        if (!this.hasSpokenLocal && this._round(audioOutputLevels.reduce((a, b) => a + b, 0) / 2) >= this.talkingThreashold) {
          this.hasSpokenLocal = true;
          this.setVoiceDetectionVolume(1.0);
          ep.audioStatsUpdate({
            id: this.id,
            talking: this.hasSpokenLocal,
          });
        } else if (this.hasSpokenLocal && this._round(audioOutputLevels.reduce((a, b) => a + b, 0) / 2) < this.talkingThreashold) {
          this.hasSpokenLocal = false;
          this.setVoiceDetectionVolume(0.0);
          ep.audioStatsUpdate({
            id: this.id,
            talking: this.hasSpokenLocal,
          });
        }
      }
    }, 5);
  }

  setOutVolume(volume) {
    this.volume = volume;
    this.outGainNode.gain.value = volume;
  }

  async setInputDevice(deviceId) {
    console.log("Setting microphone device to", deviceId);
    this.deviceId = deviceId;
    this.constraints.audio.deviceId = deviceId;


  }

  setSpeakerDevice(deviceId) {

  }

  setSpeakerVolume(volume) {

  }

  mute() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.enabled = false);
      this.isMuted = true;
    }
  }

  unmute() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.enabled = true);
      this.isMuted = false;
    }
  }

  deaf() {

  }

  undeaf() {

  }

  close() {

  }

  getAudioState() {
    return {
      isTransmitting: true,
      isMuted: this.isMuted,
      isDeaf: false,
      volume: this.volume,
      deviceId: this.inputDeviceId,
      outputDeviceId: this.outputDeviceId,
    };
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

  getConnectionStats() {
    return new Promise((resolve, reject) => {
      let ping = 0;
      let bytesSent = 0;
      let bytesReceived = 0;
      let packetsSent = 0;
      let packetsReceived = 0;
      let jitterIn = 0;
      let packetsLostIn = 0;

      let stats = this.sendTransport.getStats();
      stats.then((res) => {
        res.forEach((report) => {
          if (report.type === "candidate-pair" && report.nominated) {
            ping = report.currentRoundTripTime * 1000;
            bytesSent = report.bytesSent;
            bytesReceived = report.bytesReceived;
            packetsSent = report.packetsSent;
            packetsReceived = report.packetsReceived;
          }

          if (report.type === "remote-inbound.rtp" && report.kind === "audio") {
            jitterIn = report.jitter * 1000;
            packetsLostIn = report.packetsLost;
          }
        });
        resolve({
          ping: ping,
          bytesSent: bytesSent,
          bytesReceived: bytesReceived,
          packetsSent: packetsSent,
          packetsReceived: packetsReceived,
          jitterIn: jitterIn,
          packetsLostIn: packetsLostIn,
        })
      });
    })
  }
}

export default audioRtcTransmitter;