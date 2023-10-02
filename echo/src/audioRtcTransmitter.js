import { ep } from "./index";
const mediasoup = require("mediasoup-client");

class audioRtcTransmitter {
  constructor(id, inputDeviceId = 'default', outputDeviceId = 'default', volume = 1.0) {
    this.id = id;
    this.inputDeviceId = inputDeviceId;
    this.outputDeviceId = outputDeviceId;
    this.volume = volume;
    this.mediasoupDevice = null;
    this.sendTransport = null;
    this.rcvTransport = null;
    this.videoSendTransport = null;
    this.videoRcvTransport = null;
    this.producer = null;
    this.outChannelCount = 2;
    this.inputStreams = [];
    this.streamIds = new Map();

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

    this.videoSourceId = 'undefined'
    this.outVideoStream = null;

    this.constraints = {
      audio: {
        channelCount: 2,
        sampleRate: 48000,
        sampleSize: 16,
        volume: 1.0,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        deviceId: this.inputDeviceId,
        googNoiseSupression: false,
      },
      video: false,
    }

    this.videoConstraints = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: this.videoSourceId,
          width: { min: 800, ideal: 1920, max: 1920 },
          height: { min: 600, ideal: 1080, max: 1080 },
          frameRate: { min: 30, ideal: 60, max: 60 },
        }
      },
    }
  }

  leaveRoom() {
    //close all tranports
    if (this.sendTransport) {
      this.sendTransport.close();
      this.sendTransport = null;
    }

    if (this.rcvTransport) {
      this.rcvTransport.close();
      this.rcvTransport = null;
    }

    if (this.videoSendTransport) {
      this.videoSendTransport.close();
      this.videoSendTransport = null;
    }

    if (this.videoRcvTransport) {
      this.videoRcvTransport.close();
      this.videoRcvTransport = null;
    }
  }

  async createReceiveTransport(data) {
    if (data) {
      if (!this.mediasoupDevice.loaded) {
        await this.mediasoupDevice.load({ routerRtpCapabilities: data.rtpCapabilities });
      }
      if (this.mediasoupDevice && this.mediasoupDevice.loaded) {
        console.log("Creating receive transport", data);
        this.rcvTransport = this.mediasoupDevice.createRecvTransport({
          id: data.id,
          iceParameters: data.iceParameters,
          iceCandidates: data.iceCandidates,
          dtlsParameters: data.dtlsParameters,
          sctpParameters: data.sctpParameters,
          iceServers: data.iceServers,
          iceTransportPolicy: data.iceTransportPolicy,
          additionalSettings: data.additionalSettings,
        });

        this.rcvTransport.on("connect", async ({ dtlsParameters }, cb, errback) => {
          console.log("Receive transport connect");
          ep.receiveTransportConnect({ dtlsParameters }, cb, errback);
        });
      }
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
        id: this.id + "-audio",
        kind,
        rtpParameters,
        appData,
      }, callback, errback);
    });

    this.startAudioBroadcast();
  }

  async createReceiveVideoTransport(data) {
    console.log("Creating video receive transport", data);
    if (data) {
      if (!this.mediasoupDevice.loaded) {
        await this.mediasoupDevice.load({ routerRtpCapabilities: data.rtpCapabilities });
      }
      if (this.mediasoupDevice && this.mediasoupDevice.loaded) {
        this.videoRcvTransport = this.mediasoupDevice.createRecvTransport({
          id: data.id,
          iceParameters: data.iceParameters,
          iceCandidates: data.iceCandidates,
          dtlsParameters: data.dtlsParameters,
          sctpParameters: data.sctpParameters,
          iceServers: data.iceServers,
          iceTransportPolicy: data.iceTransportPolicy,
          additionalSettings: data.additionalSettings,
        });

        this.videoRcvTransport.on("connect", async ({ dtlsParameters }, cb, errback) => {
          console.log("Receive video transport connect");
          ep.receiveVideoTransportConnect({ dtlsParameters }, cb, errback);
        });
      }
    }
  }

  async createSendVideoTransport(data) {
    console.log("Creating video send transport", data);
    if (!this.mediasoupDevice.loaded) {
      await this.mediasoupDevice.load({ routerRtpCapabilities: data.rtpCapabilities });
    }
    this.videoSendTransport = this.mediasoupDevice.createSendTransport({
      id: data.id,
      iceParameters: data.iceParameters,
      iceCandidates: data.iceCandidates,
      dtlsParameters: data.dtlsParameters,
      sctpParameters: data.sctpParameters,
      iceServers: data.iceServers,
      iceTransportPolicy: data.iceTransportPolicy,
      additionalSettings: data.additionalSettings,
    });

    this.videoSendTransport.on("connect", async ({ dtlsParameters }, cb, errback) => {
      console.log("Send video transport connect");
      ep.sendVideoTransportConnect({ dtlsParameters }, cb, errback);
    });

    this.videoSendTransport.on("produce", async ({ kind, rtpParameters, appData }, callback, errback) => {
      console.log("Send video transport produce");
      ep.sendVideoTransportProduce({
        id: this.id + "-video",
        kind,
        rtpParameters,
        appData,
      }, callback, errback);
    });

  }

  async init() {
    this.mediasoupDevice = new mediasoup.Device();
  }

  getRtpCapabilities() {
    if (this.mediasoupDevice) {
      return this.mediasoupDevice.rtpCapabilities;
    }
  }

  async startAudioBroadcast() {
    console.log("Starting audio broadcast");
    if (!this.mediasoupDevice.canProduce("audio")) {
      console.error("Cannot produce audio");
      return;
    }

    this.outStream = await navigator.mediaDevices.getUserMedia(this.constraints, err => { console.error(err); return; });
    this.context = new AudioContext();

    const src = this.context.createMediaStreamSource(this.outStream);
    const dst = this.context.createMediaStreamDestination();
    this.outChannelCount = src.channelCount;

    this.outGainNode = this.context.createGain();
    this.vadNode = this.context.createGain();
    this.channelSplitter = this.context.createChannelSplitter(this.outChannelCount);

    src.connect(this.outGainNode);
    this.outGainNode.connect(this.channelSplitter);
    this.outGainNode.connect(this.vadNode);
    this.vadNode.connect(dst);

    this.analyser = this.createAudioAnalyser(this.context, this.channelSplitter, this.outChannelCount);

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

  async stopAudioBroadcast() {
    console.log("Stopping audio broadcast");
    if (this.producer) {
      this.producer.close();
      this.producer = null;
    }
    if (this.outStream) {
      this.outStream.getTracks().forEach(track => track.stop());
      this.outStream = null;
    }

    ep.stopAudioBroadcast({ id: this.id });
  }

  async consume(data) {
    console.log("Consuming audio", data)
    const consumer = await this.rcvTransport.consume({
      id: data.id,
      producerId: data.producerId,
      kind: data.kind,
      rtpParameters: data.rtpParameters,
    });

    const { track } = consumer;
    let context = new AudioContext();

    if (this.outputDeviceId !== 'default' && this.outputDeviceId) {
      context.setSinkId(this.outputDeviceId);
    }
    let stream = new MediaStream([track])
    this.streamIds.set(data.producerId, stream.id);
    let src = context.createMediaStreamSource(stream);
    let dst = context.destination;

    let personalGainNode = context.createGain();
    let gainNode = context.createGain();
    let deafNode = context.createGain();

    let channelSplitter = context.createChannelSplitter(src.channelCount);

    src.connect(personalGainNode);
    personalGainNode.connect(gainNode);
    gainNode.connect(deafNode);
    deafNode.connect(channelSplitter);
    deafNode.connect(dst);

    context.resume();

    //Chrome bug fix
    let audioElement = new Audio();

    audioElement.srcObject = stream;
    audioElement.autoplay = true;
    audioElement.pause();

    this.inputStreams.push({
      consumer,
      source: src,
      stream,
      context,
      gainNode,
      deafNode,
      personalGainNode,
      audioElement,
      analyser: this.createAudioAnalyser(context, channelSplitter, src.channelCount),
    });

    ep.resumeStream({ id: this.id, producerId: data.producerId });
  }

  async stopConsuming(senderId) {
    if (senderId) {
      //Close specific sender
      console.log("Stopping consuming", senderId);
      this.inputStreams.forEach((stream, index) => {
        if (stream.consumer.producerId === senderId) {
          stream.consumer.close();
          stream.context.close();
          stream.stream.getTracks().forEach(track => track.stop());
          stream.audioElement.remove();
          this.inputStreams.splice(index, 1);
        }
      });

      ep.unsubscribeAudio({ id: this.id, producerId: senderId });
    } else {
      //Close all senders
      console.log("Stopping consuming all");
      this.inputStreams.forEach((stream) => {
        ep.unsubscribeAudio({ id: this.id, producerId: stream.consumer.producerId });
        stream.consumer.close();
        stream.context.close();
        stream.stream.getTracks().forEach(track => track.stop());
        stream.audioElement.remove();
      });

      this.inputStreams = [];
    }
  }

  async startScreenShare() {
    console.log("Starting screen share");
    if (!this.mediasoupDevice.canProduce("video")) {
      console.error("Cannot produce video");
      return;
    }

    if (this.videoSourceId === 'undefined') {
      console.error("No video source id");
      return;
    }

    this.outVideoStream = await navigator.mediaDevices.getUserMedia(this.videoConstraints, err => { console.error(err); return; });
    const videoTrack = this.outVideoStream.getVideoTracks()[0];
    this.videoProducer = await this.videoSendTransport.produce({
      track: videoTrack,
      codecOptions: {
        videoGoogleStartBitrate: 3000,
        videoGoogleMaxBitrate: 20000,
        videoGoogleMinBitrate: 3000,
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

  _findUserId(stream) {
    // find the userId from the streamId using streamIds
    let userId = null;
    for (const [key, value] of this.streamIds) {
      if (value === stream.stream.id) {
        userId = key;
        break;
      }
    }
    console.log("found userId", userId, "for streamId", stream.stream.id)
    return userId;
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
        let audioOutputLevels = this.calculateAudioLevels(this.analyser.analyser, this.analyser.freqs, this.outChannelCount);
        //console.log("audioOutputLevels", audioOutputLevels, this._round(audioOutputLevels.reduce((a, b) => a + b, 0) / 2))
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
    if (deviceId === this.inputDeviceId || deviceId === 'default') {
      return;
    }

    console.log("Setting microphone device to", deviceId);
    this.inputDeviceId = deviceId;
    this.constraints.audio.deviceId = deviceId;

    if (this.outStream) {
      let newStream = await navigator.mediaDevices.getUserMedia(this.constraints, err => { console.error(err); return; });
      this.context = new AudioContext();

      const src = this.context.createMediaStreamSource(newStream);
      const dst = this.context.createMediaStreamDestination();
      this.outChannelCount = src.channelCount;

      this.outGainNode = this.context.createGain();
      this.vadNode = this.context.createGain();
      this.channelSplitter = this.context.createChannelSplitter(this.outChannelCount);

      src.connect(this.outGainNode);
      this.outGainNode.connect(this.channelSplitter);
      this.outGainNode.connect(this.vadNode);
      this.vadNode.connect(dst);

      this.analyser = this.createAudioAnalyser(this.context, this.channelSplitter, this.outChannelCount);

      this.setOutVolume(this.volume);

      const audioTrack = dst.stream.getAudioTracks()[0];
      await this.producer.replaceTrack({ track: audioTrack });

      this.outStream.getTracks().forEach(track => track.stop());
      this.outStream = newStream;

    }
  }

  setScreenShareDevice(deviceId) {
    this.videoSourceId = deviceId;
    this.videoConstraints.video.mandatory.chromeMediaSourceId = deviceId;
  }

  setSpeakerDevice(deviceId) {
    if (deviceId === 'default') {
      return
    }
    console.log("Setting speaker device to", deviceId);
    this.outputDeviceId = deviceId;

    if (this.inputStreams) {
      this.inputStreams.forEach((stream) => {
        stream.context.setSinkId(deviceId);
      });
    }
  }

  setSpeakerVolume(volume) {
    if (volume > 1.0 || volume < 0.0) {
      console.error("Volume must be between 0.0 and 1.0", volume);
      volume = 1.0;
    }

    this.inputStreams.forEach((stream) => {
      stream.gainNode.gain.value = volume;
    });
  }

  setPersonalVolume(userId, volume) {
    if (volume > 1.0 || volume < 0.0) {
      console.error("Volume must be between 0.0 and 1.0", volume);
      volume = 1.0;
    }

    this.inputStreams.forEach((stream) => {
      if (stream.consumer.producerId === userId) {
        stream.personalGainNode.gain.value = volume;
      }
    });
  }

  mute() {
    if (this.outStream) {
      this.outStream.getTracks().forEach(track => track.enabled = false);
      this.isMuted = true;
    }
  }

  unmute() {
    if (this.outStream) {
      this.outStream.getTracks().forEach(track => track.enabled = true);
      this.isMuted = false;
    }
  }

  deaf() {
    this.inputStreams.forEach((stream) => {
      stream.deafNode.gain.value = 0.0;
    });
  }

  undeaf() {
    this.inputStreams.forEach((stream) => {
      stream.deafNode.gain.value = 1.0;
    });
  }

  close() {
    this.leaveRoom();
    this.stopAudioBroadcast();
    this.stopConsuming();
    clearInterval(this.statsInterval);
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

      if (!this.sendTransport) {
        resolve({
          ping: ping,
          bytesSent: bytesSent,
          bytesReceived: bytesReceived,
          packetsSent: packetsSent,
          packetsReceived: packetsReceived,
          jitterIn: jitterIn,
          packetsLostIn: packetsLostIn,
        })
      }
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