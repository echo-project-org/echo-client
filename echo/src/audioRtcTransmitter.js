import { ep } from "./index";

const goodOpusSettings = "minptime=10;useinbandfec=1;maxplaybackrate=48000;stereo=1;maxaveragebitrate=510000";
const mediasoup = require("mediasoup-client");

class audioRtcTransmitter {
  constructor(id, inputDeviceId = 'default', outputDeviceId = 'default', volume = 1.0) {
    this.id = id;
    this.inputDeviceId = inputDeviceId;
    this.outputDeviceId = outputDeviceId;
    this.volume = volume;
    this.device = null;
    this.sendTransport = null;
    this.producer = null;
    this.outChannelCount = 2;

    this.outStream = null;
    /**
     * @type {GainNode}
     * @description Output gain node
     */
    this.outGainNode = null;

    /**
     * @type {GainNode}
     * @description Voice activity detection gain node
     */
    this.vadNode = null;

    this.analyser = null;

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

  createSendTransport() {
    return ep.socket.request("create-transport", {
      forceTcp: false,
      rtpPort: 0,
      rtcpPort: 0,
      sctpPort: 0,
      rtpMux: true,
      comedia: false,
      internal: false,
      probator: false,
      multiSource: false,
      appData: {},
    });
  }

  async init() {
    this.device = await mediasoup.Device.load({ handlerName: "Chrome" });
    this.sendTransport = await this.createSendTransport();
    this.sendTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
      ep.socket
        .request("connect-transport", {
          transportId: this.sendTransport.id,
          dtlsParameters,
        })
        .then(callback)
        .catch(errback);
    });

    this.sendTransport.on("produce", async ({ kind, rtpParameters, appData }, callback, errback) => {
      try {
        const { producerId } = await ep.socket.request("produce", {
          transportId: this.sendTransport.id,
          kind,
          rtpParameters,
          appData,
        });
        callback({ producerId });
      } catch (err) {
        errback(err);
      }
    });
  }

  async startAudioBroadcast() {
    this.outStream = await navigator.mediaDevices.getUserMedia(this.constraints, err => { console.error(err); return; });
    const context = new AudioContext();

    const src = context.createMediaStreamSource(this.outStream);
    const dst = context.createMediaStreamDestination();
    this.outChannelCount = src.channelCount;

    this.outGainNode = context.createGain();
    this.vadNode = context.createGain();
    this.channelSplitter = context.createChannelSplitter(this.outChannelCount);

    src.connect(this.channelSplitter);
    this.outGainNode.connect(this.channelSplitter);
    this.outGainNode.connect(this.vadNode);
    this.vadNode.connect(dst);

    this.analyser = this.createAudioAnalyser(context, this.channelSplitter, this.outChannelCount);

    this.setOutVolume(this.volume);
    //Add tracks to mediasoup
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

  setOutVolume(volume) {
    this.volume = volume;
    this.outGainNode.gain.value = volume;
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
}

export default audioRtcTransmitter;