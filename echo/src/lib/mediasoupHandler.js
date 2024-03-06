import { ep } from "../index";
const { ipcRenderer } = window.require('electron');
const mediasoup = require("mediasoup-client");

/**
 * Class representing a mediasoup handler.
 * @class
 */
class mediasoupHandler {
  /**
   * MediasoupHandler class constructor.
   * @constructor
   * @param {string} id - The ID of the mediasoup handler.
   * @param {string} [inputDeviceId='default'] - The ID of the input device.
   * @param {string} [outputDeviceId='default'] - The ID of the output device.
   * @param {number} [volume=1.0] - The volume level.
   * @param {boolean} [noiseSuppression=false] - Whether noise suppression is enabled.
   * @param {boolean} [echoCancellation=false] - Whether echo cancellation is enabled.
   * @param {boolean} [autoGainControl=false] - Whether automatic gain control is enabled.
   */
  constructor(id, inputDeviceId = 'default', outputDeviceId = 'default', volume = 1.0, noiseSuppression = false, echoCancellation = false, autoGainControl = false) {
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
    this.hasSpokenLocal = false;

    this.isMuted = false;
    this.isDeaf = false;
    this.context = null;
    this.outStream = null;
    this.outGainNode = null;
    this.vadNode = null;

    this.analyser = null;
    this.talkingTreshold = 0.3;
    this.talkingTresholdRemote = 0.3;
    this.statsInterval = null;
    this.inputLevel = 0;
    this.outputLevel = 0;

    this.testContext = null;
    this.testGainNode = null;
    this.testVadNode = null;
    this.testSplitter = null;

    this.videoSourceId = 'undefined'
    this.outVideoStream = null;
    this.videoProducer = null;
    this.videoConsumer = null;
    this.inVideoStream = null;

    this.constraints = {
      audio: {
        channelCount: 2,
        sampleRate: 48000,
        sampleSize: 16,
        volume: 1.0,
        echoCancellation: echoCancellation,
        noiseSuppression: noiseSuppression,
        autoGainControl: autoGainControl,
        deviceId: this.inputDeviceId,
        googNoiseSupression: noiseSuppression,
        googAutoGainControl: autoGainControl,
      },
      video: false,
    }

    this.videoConstraints = {
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: this.videoSourceId,
          channelCount: 2,
          sampleRate: 48000,
          sampleSize: 16,
          volume: 1.0,
        },
      },
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

  /**
   * Closes all transports and clears the stats interval.
   * @function
   * @name leaveRoom
   * @memberof MediasoupHandler
   * @instance
   * @returns {void}
   */
  leaveRoom() {
    //close all tranports
    ep.sendToSocket("exit", { id: this.id });

    try {
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

      if (this.statsInterval) {
        clearInterval(this.statsInterval);
        this.statsInterval = null;
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Checks if the send transport is fully connected.
   * @returns {boolean} Whether the send transport is fully connected or not.
   */
  isFullyConnected() {
    if (this.sendTransport) {
      return (
        this.sendTransport.connectionState === "connected"
      )
    } else {
      return true;
    }
  }

  /**
   * Creates a new receive transport for mediasoup based on the given data.
   * @async
   * @param {Object} data - The data required to create the receive transport.
   * @param {string} data.id - The ID of the receive transport.
   * @param {RTCIceParameters} data.iceParameters - The ICE parameters for the transport.
   * @param {RTCIceCandidate[]} data.iceCandidates - The ICE candidates for the transport.
   * @param {RTCDtlsParameters} data.dtlsParameters - The DTLS parameters for the transport.
   * @param {RTCSctpParameters} data.sctpParameters - The SCTP parameters for the transport.
   * @param {RTCIceServer[]} data.iceServers - The ICE servers for the transport.
   * @param {string} data.iceTransportPolicy - The ICE transport policy for the transport.
   * @param {Object} data.additionalSettings - Additional settings for the transport.
   */
  async createReceiveTransport(data) {
    if (data) {
      if (!this.mediasoupDevice.loaded) {
        await this.mediasoupDevice.load({ routerRtpCapabilities: data.rtpCapabilities });
      }
      if (this.mediasoupDevice && this.mediasoupDevice.loaded) {
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
          ep.sendToSocket("receiveTransportConnect", { dtlsParameters }, (response) => {
            if (response === 'error') {
              errback(response);
            } else {
              cb(response);
            }
          });
        });
      }
    }
  }

  /**
   * Creates a new send transport for mediasoup.
   * @async
   * @param {Object} data - The data required to create the send transport.
   * @param {string} data.id - The ID of the send transport.
   * @param {RTCIceParameters} data.iceParameters - The ICE parameters for the send transport.
   * @param {RTCIceCandidate[]} data.iceCandidates - The ICE candidates for the send transport.
   * @param {RTCDtlsParameters} data.dtlsParameters - The DTLS parameters for the send transport.
   * @param {RTCSctpParameters} data.sctpParameters - The SCTP parameters for the send transport.
   * @param {RTCIceServer[]} data.iceServers - The ICE servers for the send transport.
   * @param {string} data.iceTransportPolicy - The ICE transport policy for the send transport.
   * @param {Object} data.additionalSettings - Additional settings for the send transport.
   * @returns {Promise<void>} - A Promise that resolves when the send transport is created.
   */
  async createSendTransport(data) {
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
      ep.sendToSocket("sendTransportConnect", { dtlsParameters }, (response) => {
        if (response === 'error') {
          errback(response);
        } else {
          cb(response);
        }
      });
    });

    this.sendTransport.on("produce", async ({ kind, rtpParameters, appData }, callback, errback) => {
      ep.sendToSocket("sendTransportProduce", {
        id: this.id + "-audio",
        kind,
        rtpParameters,
        appData,
      }, (response) => {
        if (response === 'error') {
          errback(response);
        } else {
          callback(response);
        }
      });
    });

    this.startAudioBroadcast();
  }

  /**
   * Creates a new receive video transport using the provided data.
   * @async
   * @param {Object} data - The data needed to create the transport.
   * @param {string} data.id - The ID of the transport.
   * @param {Object} data.iceParameters - The ICE parameters for the transport.
   * @param {Array} data.iceCandidates - The ICE candidates for the transport.
   * @param {Object} data.dtlsParameters - The DTLS parameters for the transport.
   * @param {Object} data.sctpParameters - The SCTP parameters for the transport.
   * @param {Array} data.iceServers - The ICE servers for the transport.
   * @param {string} data.iceTransportPolicy - The ICE transport policy for the transport.
   * @param {Object} data.additionalSettings - Additional settings for the transport.
   * @param {Object} data.rtpCapabilities - The RTP capabilities for the transport.
   */
  async createReceiveVideoTransport(data) {
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
          ep.sendToSocket("receiveVideoTransportConnect", { dtlsParameters }, (response) => {
            if (response === 'error') {
              errback(response);
            } else {
              cb(response);
            }
          });
        });
      }
    }
  }

  /**
   * Creates a send transport for video.
   * @async
   * @function
   * @param {Object} data - The data required to create the send transport.
   * @param {string} data.id - The ID of the transport.
   * @param {RTCIceParameters} data.iceParameters - The ICE parameters.
   * @param {RTCIceCandidate[]} data.iceCandidates - The ICE candidates.
   * @param {RTCDtlsParameters} data.dtlsParameters - The DTLS parameters.
   * @param {RTCSctpParameters} data.sctpParameters - The SCTP parameters.
   * @param {RTCIceServer[]} data.iceServers - The ICE servers.
   * @param {string} data.iceTransportPolicy - The ICE transport policy.
   * @param {Object} data.additionalSettings - Additional settings for the transport.
   * @returns {Promise<void>} - Resolves when the transport is created.
   */
  async createSendVideoTransport(data) {
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
      ep.sendToSocket("sendVideoTransportConnect", { dtlsParameters }, (response) => {
        if (response === 'error') {
          errback(response);
        } else {
          cb(response);
        }
      });
    });

    this.videoSendTransport.on("produce", async ({ kind, rtpParameters, appData }, callback, errback) => {
      console.log(kind)
      if (kind === "video") {
        ep.sendToSocket("sendVideoTransportProduce", {
          id: this.id + "-video",
          kind,
          rtpParameters,
          appData,
        }, (response) => {
          if (response === 'error') {
            errback(response);
          } else {
            callback(response);
          }
        });
      } else if (kind === "audio") {
        ep.sendToSocket("sendVideoAudioTransportProduce", {
          id: this.id + "-video-audio",
          kind,
          rtpParameters,
          appData,
        }, (response) => {
          if (response === 'error') {
            errback(response);
          } else {
            callback(response);
          }
        });
      }
    });
  }

  /**
   * Initializes the mediasoup device.
   * @returns {Promise<void>}
   */
  async init() {
    this.mediasoupDevice = new mediasoup.Device();
  }

  /**
   * Returns the RTP capabilities of the mediasoup device.
   * @returns {RTCRtpCapabilities} The RTP capabilities of the mediasoup device.
   */
  getRtpCapabilities() {
    if (this.mediasoupDevice) {
      return this.mediasoupDevice.rtpCapabilities;
    }
  }

  /**
   * Starts the audio broadcast by creating a media stream source and connecting it to a media stream destination.
   * It then creates an audio analyser and sets the output volume.
   * If the audio is muted, it mutes the output.
   * Finally, it produces the audio track and sends it over the send transport.
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async startAudioBroadcast() {
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

    if (this.isMuted) {
      this.mute();
    }

    const audioTrack = dst.stream.getAudioTracks()[0];
    this.producer = await this.sendTransport.produce({
      track: audioTrack,
      codecOptions: {
        opusStereo: true,
        opusDtx: true,
      },
    });
  }

  /**
   * Stops the audio broadcast by closing the producer and stopping all tracks in the output stream.
   * Also calls the `stopAudioBroadcast` method of the `ep` object with the current instance's ID.
   * @async
   */
  async stopAudioBroadcast() {
    if (this.producer) {
      this.producer.close();
      this.producer = null;
    }
    if (this.outStream) {
      this.outStream.getTracks().forEach(track => track.stop());
      this.outStream = null;
    }

    ep.sendToSocket("stopAudioBroadcast", { id: this.id });
  }

  /**
   * Consume a media stream and add it to the list of input streams.
   * @async
   * @param {Object} data - The data object containing the ID, producer ID, kind, and RTP parameters of the media stream.
   * @param {string} data.id - The ID of the media stream.
   * @param {string} data.producerId - The ID of the producer of the media stream.
   * @param {string} data.kind - The kind of the media stream.
   * @param {RTCRtpParameters} data.rtpParameters - The RTP parameters of the media stream.
   * @returns {Promise<void>}
   */
  async consume(data) {
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

    if (this.isDeaf) {
      deafNode.gain.value = 0.0;
    }

    context.resume();

    //Chrome bug fix
    let audioElement = new Audio();

    audioElement.srcObject = stream;
    audioElement.autoplay = true;
    audioElement.pause();

    this.inputStreams.push({
      producerId: data.producerId,
      consumer,
      source: src,
      stream,
      context,
      gainNode,
      deafNode,
      personalGainNode,
      audioElement,
      hasSpoken: false,
      analyser: this.createAudioAnalyser(context, channelSplitter, src.channelCount),
    });

    ep.sendToSocket("resumeStream", { id: this.id, producerId: data.producerId });
  }

  /**
   * Stops consuming media from a specific sender or from all senders.
   * @async
   * @param {string} [senderId] - The ID of the sender to stop consuming from. If not provided, all senders will be stopped.
   * @returns {Promise<void>}
   */
  async stopConsuming(senderId) {
    if (senderId) {
      //Close specific sender
      this.inputStreams.forEach((stream, index) => {
        if (stream.consumer.producerId === senderId) {
          stream.consumer.close();
          stream.context.close();
          stream.stream.getTracks().forEach(track => track.stop());
          this.inputStreams.splice(index, 1);
        }
      });

      ep.sendToSocket("unsubscribeAudio", { id: this.id, producerId: senderId });
    } else {
      //Close all senders
      this.inputStreams.forEach((stream) => {
        ep.sendToSocket("unsubscribeAudio", { id: this.id, producerId: stream.consumer.producerId });
        stream.consumer.close();
        stream.context.close();
        stream.stream.getTracks().forEach(track => track.stop());
        stream.audioElement.remove();
      });

      this.inputStreams = [];
    }
  }

  /**
   * Starts screen sharing if the device can produce video and a video source ID is available.
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async startScreenShare() {
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
        videoGoogleMaxBitrate: 10000,
        videoGoogleMinBitrate: 3000,
      },
    });

    const audioTrack = this.outStream.getAudioTracks()[0];
    console.log(audioTrack)
    if (audioTrack) {
      this.videoAudioProducer = await this.videoSendTransport.produce({
        track: audioTrack,
        codecOptions: {
          opusStereo: true,
          opusDtx: true,
        },
      });
    }
  }

  /**
   * Stops the screen sharing by closing the video producer and stopping the tracks of the outgoing video stream.
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async stopScreenShare() {
    ep.sendToSocket("stopScreenSharing", { id: this.id });

    if (this.videoProducer) {
      this.videoProducer.close();
      this.videoProducer = null;
    }

    if (this.outVideoStream) {
      this.outVideoStream.getTracks().forEach(track => track.stop());
      this.outVideoStream = null;
    }
  }

  /**
   * Checks if screen sharing is currently active.
   * @returns {boolean} Whether screen sharing is active or not.
   */
  isScreenSharing() {
    return this.videoProducer !== null;
  }

  /**
   * Consume a video stream from the remote producer and send it to the front-end.
   * @async
   * @param {Object} data - The data object containing the ID, producer ID, kind, and RTP parameters of the video stream.
   * @param {string} data.id - The ID of the video stream.
   * @param {string} data.producerId - The ID of the producer of the video stream.
   * @param {string} data.kind - The kind of the video stream.
   * @param {RTCRtpParameters} data.rtpParameters - The RTP parameters of the video stream.
   * @returns {Promise<void>}
   */
  async consumeVideo(data) {
    const videoDescription = data.videoDescription;
    const videoAudioDescription = data.videoAudioDescription;

    this.videoConsumer = await this.videoRcvTransport.consume({
      id: videoDescription.id + "video",
      producerId: videoDescription.producerId,
      kind: videoDescription.kind,
      rtpParameters: videoDescription.rtpParameters,
    });

    console.log(videoAudioDescription)
    if (videoAudioDescription.id) {
      this.videoAudioConsumer = await this.videoRcvTransport.consume({
        id: videoAudioDescription.id + "-video-audio",
        producerId: videoAudioDescription.producerId,
        kind: videoAudioDescription.kind,
        rtpParameters: videoAudioDescription.rtpParameters,
      });
    }

    const { track } = this.videoConsumer;
    this.inVideoStream = new MediaStream([track]);

    //add audioTrack to inVideoStream
    if (this.AudioVideoConsumer) {
      console.log("Adding audio track to video stream")
      const { audioTrack } = this.videoAudioConsumer;
      if (audioTrack) {
        this.inVideoStream.addTrack(audioTrack);
      }
    }

    ep.sendToSocket("resumeVideoStream", { id: this.id, producerId: videoDescription.producerId })
    ep.sendVideoStreamToFrontEnd({ id: videoDescription.producerId, stream: this.inVideoStream });
  }

  /**
   * Stops consuming video for the given sender ID.
   *
   * @param {string} senderId - The ID of the sender whose video should be stopped.
   */
  stopConsumingVideo(senderId) {
    ep.sendToSocket("stopReceivingVideo", { id: senderId });

    if (this.videoConsumer) {
      this.videoConsumer.close();
      this.videoConsumer = null;
    }

    if (this.inVideoStream) {
      this.inVideoStream.getTracks().forEach(track => track.stop());
      this.inVideoStream = null;
    }
  }

  /**
   * Get the current video stream.
   *
   * @returns {MediaStream} The current video stream.
   */
  getVideo() {
    return this.inVideoStream;
  }

  /**
   * Creates an audio analyser for the given context, splitter and channel count.
   * @param {AudioContext} context - The audio context to use.
   * @param {ChannelSplitterNode} splitter - The channel splitter to use.
   * @param {number} channelCount - The number of channels to use.
   * @returns {{analyser: Object, freqs: Object}} - An object containing the created analyser and frequency data.
   */
  createAudioAnalyser(context, splitter, channelCount) {
    const analyser = {};
    const freqs = {};
    for (let i = 0; i < channelCount; i++) {
      analyser[i] = context.createAnalyser();

      // for human voice
      // https://github.com/Jam3/voice-activity-detection/blob/master/index.js

      analyser[i].fftSize = 1024;
      analyser[i].bufferLen = 1024;
      analyser[i].smoothingTimeConstant = 0.8;
      analyser[i].minCaptureFreq = 85;
      analyser[i].maxCaptureFreq = 255;
      analyser[i].noiseCaptureDuration = 1000;
      analyser[i].minNoiseLevel = 0.1;
      analyser[i].maxNoiseLevel = 0.5;
      analyser[i].avgNoiseMultiplier = 1.0;

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

  /**
   * Calculates the audio levels for the given analyser, frequency data and channel count.
   * @param {AnalyserNode[]} analyser - The analyser nodes to use for calculating audio levels.
   * @param {Uint8Array[]} freqs - The frequency data arrays to use for calculating audio levels.
   * @param {number} channelCount - The number of audio channels to calculate levels for.
   * @returns {number[]} An array of audio levels, one for each channel.
   */
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

  /**
   * Rounds a number to one decimal place.
   *
   * @param {number} num - The number to round.
   * @returns {number} The rounded number.
   */
  _round(num) {
    return Math.round((num + Number.EPSILON) * 10) / 10;
  }

  /**
   * Sets the volume for voice detection.
   * @param {number} volume - The volume to set, between 0.0 and 1.0.
   */
  setVoiceDetectionVolume(volume) {
    if (volume > 1.0 || volume < 0.0) {
      console.error("Volume must be between 0.0 and 1.0", volume);
      volume = 1.0;
    }

    //cancel previous time change
    this.vadNode.gain.cancelAndHoldAtTime(0);

    //ramp volume to new value in 1 second
    if (volume === 1.0) {
      this.vadNode.gain.value = 1.0;
    } else {
      this.vadNode.gain.linearRampToValueAtTime(0.0, this.context.currentTime + 2);
    }
  }

  setTestVoiceDetectionVolume(volume) {
    if (this.testVadNode) {
      this.testVadNode.gain.cancelAndHoldAtTime(0);

      if (volume === 1.0) {
        this.testVadNode.gain.value = 1.0;
      } else {
        this.testVadNode.gain.linearRampToValueAtTime(0.0, this.testContext.currentTime + 2);
      }
    }
  }

  /**
   * Starts the stats interval to calculate audio levels for local and remote users.
   * @returns {void}
   */
  startStatsInterval() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }

    this.statsInterval = setInterval(() => {
      // remote user's audio levels
      if (this.inputStreams) {
        this.inputStreams.forEach((stream) => {
          let audioInputLevels = this.calculateAudioLevels(stream.analyser.analyser, stream.analyser.freqs, stream.source.channelCount);
          if (!stream.hasSpoken && this._round(audioInputLevels.reduce((a, b) => a + b, 0) / 2) >= this.talkingTresholdRemote) {
            stream.hasSpoken = true;
            ep.audioStatsUpdate({
              id: stream.producerId,
              talking: stream.hasSpoken,
            });
          } else if (stream.hasSpoken && this._round(audioInputLevels.reduce((a, b) => a + b, 0) / 2) < this.talkingTresholdRemote) {
            stream.hasSpoken = false;
            ep.audioStatsUpdate({
              id: stream.producerId,
              talking: stream.hasSpoken,
            });
          }
        });
      }

      // local user's audio levels
      if (this.analyser) {
        let audioOutputLevels = this.calculateAudioLevels(this.analyser.analyser, this.analyser.freqs, this.outChannelCount);
        if (!this.hasSpokenLocal && this._round(audioOutputLevels.reduce((a, b) => a + b, 0) / 2) >= this.talkingTreshold) {
          this.hasSpokenLocal = true;
          this.setVoiceDetectionVolume(1.0);
          ep.audioStatsUpdate({
            id: this.id,
            talking: this.hasSpokenLocal,
          });
        } else if (this.hasSpokenLocal && this._round(audioOutputLevels.reduce((a, b) => a + b, 0) / 2) < this.talkingTreshold) {
          this.hasSpokenLocal = false;
          this.setVoiceDetectionVolume(0.0);
          ep.audioStatsUpdate({
            id: this.id,
            talking: this.hasSpokenLocal,
          });
        }
      }

      if (this.testAnalyser) {
        let audioOutputLevels = this.calculateAudioLevels(this.testAnalyser.analyser, this.testAnalyser.freqs, this.outChannelCount);
        if (!this.hasSpokenLocal && this._round(audioOutputLevels.reduce((a, b) => a + b, 0) / 2) >= this.talkingTreshold) {
          this.hasSpokenLocal = true;
          this.setTestVoiceDetectionVolume(1.0);
        } else if (this.hasSpokenLocal && this._round(audioOutputLevels.reduce((a, b) => a + b, 0) / 2) < this.talkingTreshold) {
          this.hasSpokenLocal = false;
          this.setTestVoiceDetectionVolume(0.0);
        }
      }
    }, 20);
  }

  /**
   * Sets the output volume for the audio stream.
   * @param {number} volume - The desired volume level (0-1).
   */
  setOutVolume(volume) {
    if (!volume) {
      console.warn("Volume is undefined, setting to 1");
      volume = 1.0;
    }
    this.volume = volume;
    if (this.outGainNode) {
      this.outGainNode.gain.value = volume;
    }

    if (this.testGainNode) {
      this.testGainNode.gain.value = volume;
    }
  }

  /**
   * Sets the talking threshold for the MediasoupHandler instance.
   * @param {number} threshold - The new talking threshold value.
   */
  setVadTreshold(threshold) {
    this.talkingTreshold = threshold;
  }

  /**
   * Sets whether to start or stop listening to the local microphone stream.
   * @param {boolean} value - Whether to start or stop listening to the local microphone stream.
   */
  setMicrophoneTest(value) {
    if (value) {
      this.startListeningLocalStream();
    } else {
      this.stopListeningLocalStream();
    }
  }


  /**
   * Starts listening to the local stream.
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async startListeningLocalStream() {
    if (!this.outStream) {
      this.outStream = await navigator.mediaDevices.getUserMedia(this.constraints, err => { console.error(err); return; });
    }

    this.testContext = new AudioContext();

    if (this.outputDeviceId !== 'default' && this.outputDeviceId) {
      this.testContext.setSinkId(this.outputDeviceId);
    }
    let stream = new MediaStream([this.outStream.getAudioTracks()[0]])
    let src = this.testContext.createMediaStreamSource(stream);
    let dst = this.testContext.destination;

    this.testGainNode = this.testContext.createGain();
    this.testVadNode = this.testContext.createGain();
    this.testSplitter = this.testContext.createChannelSplitter(this.outChannelCount);

    this.testAnalyser = this.createAudioAnalyser(this.testContext, this.testSplitter, this.outChannelCount);

    if (this.vadNode) {
      this.testVadNode.gain.value = this.vadNode.gain.value;
    } else {
      this.testVadNode.gain.value = 1;
    }

    if (this.outGainNode) {
      this.testGainNode.gain.value = this.outGainNode.gain.value;
    } else {
      this.testGainNode.gain.value = 1;
    }

    src.connect(this.testGainNode);
    this.testGainNode.connect(this.testVadNode);
    this.testGainNode.connect(this.testSplitter);
    this.testVadNode.connect(dst);

    this.testContext.resume();

    //Chrome bug fix
    let audioElement = new Audio();

    audioElement.srcObject = this.outStream;
    audioElement.autoplay = true;
    audioElement.pause();
  }

  /**
   * Stops listening to the local stream.
   * @returns {void}
   */
  stopListeningLocalStream() {
    if (this.testContext) {
      this.testContext.close();
      this.testContext = null;
    }

    if (this.testVadNode) {
      this.testVadNode = null;
    }

    if (this.testGainNode) {
      this.testGainNode = null;
    }

    if (this.testAnalyser) {
      this.testAnalyser = null;
    }
  }

  /**
   * Sets the input device for the mediasoup handler. If the device ID provided is the same as the current device ID, nothing happens.
   * @async
   * @param {string} deviceId - The ID of the input device to set.
   * @returns {Promise<void>}
   */
  async setInputDevice(deviceId) {
    if (deviceId === this.inputDeviceId || deviceId === 'default') {
      return;
    }

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

  /**
   * Sets the echo cancellation value for the audio constraints and updates the media stream. If the value provided is the same as the current value, nothing happens.
   * @async
   * @param {boolean} value - The new value for echo cancellation.
   * @returns {Promise<void>} - A Promise that resolves when the media stream is updated with the new constraints.
   */
  async setEchoCancellation(value) {
    if (value === this.constraints.audio.echoCancellation) {
      return;
    }

    this.constraints.audio.echoCancellation = value;
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

      if (this.producer && !this.producer.closed) {
        await this.producer.replaceTrack({ track: audioTrack });
      }

      this.outStream.getTracks().forEach(track => track.stop());
      this.outStream = newStream;

      if (this.testContext) {
        this.startListeningLocalStream();
      }
    }
  }


  /**
   * Sets the noise suppression value for the audio constraints and updates the audio stream if it is currently active. If the value provided is the same as the current value, nothing happens.
   * @async
   * @param {boolean} value - The new noise suppression value to set.
   * @returns {Promise<void>}
   */
  async setNoiseSuppression(value) {
    if (value === this.constraints.audio.googNoiseSupression) {
      return;
    }

    this.constraints.audio.noiseSuppression = value;
    this.constraints.audio.googNoiseSupression = value;
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

      if (this.producer && !this.producer.closed) {
        await this.producer.replaceTrack({ track: audioTrack });
      }

      this.outStream.getTracks().forEach(track => track.stop());
      this.outStream = newStream;

      if (this.testContext) {
        this.startListeningLocalStream();
      }
    }
  }

  /**
   * Sets the value of the auto gain control for the audio constraints. If the value provided is the same as the current value, nothing happens.
   * @async
   * @param {boolean} value - The value to set for the auto gain control.
   * @returns {Promise<void>} - A Promise that resolves when the auto gain control is set.
   */
  async setAutoGainControl(value) {
    if (value === this.constraints.audio.autoGainControl) {
      return;
    }

    this.constraints.audio.autoGainControl = value;
    this.constraints.audio.googAutoGainControl = value;
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

      if (this.producer && !this.producer.closed) {
        await this.producer.replaceTrack({ track: audioTrack });
      }

      this.outStream.getTracks().forEach(track => track.stop());
      this.outStream = newStream;

      if (this.testContext) {
        this.startListeningLocalStream();
      }
    }
  }

  /**
   * Sets the screen share device to use for capturing video.
   * @param {string} deviceId - The ID of the screen share device to use.
   */
  setScreenShareDevice(deviceId) {
    this.videoSourceId = deviceId;
    this.videoConstraints.video.mandatory.chromeMediaSourceId = deviceId;
  }

  /**
   * Sets the output device ID for audio playback.
   * @param {string} deviceId - The ID of the output device to use.
   */
  setSpeakerDevice(deviceId) {
    if (deviceId === 'default') {
      return
    }

    this.outputDeviceId = deviceId;

    if (this.inputStreams) {
      this.inputStreams.forEach((stream) => {
        stream.context.setSinkId(deviceId);
      });
    }

    if (this.testContext) {
      this.testContext.setSinkId(deviceId);
    }
  }

  /**
   * Sets the speaker volume for the input streams.
   * @param {number} volume - The volume level to set, between 0.0 and 1.0.
   */
  setSpeakerVolume(volume) {
    if (volume > 1.0 || volume < 0.0) {
      console.error("Volume must be between 0.0 and 1.0", volume);
      volume = 1.0;
    }

    this.inputStreams.forEach((stream) => {
      stream.gainNode.gain.value = volume;
    });

    if (this.testGainNode) {
      this.testGainNode.gain.value = volume;
    }
  }

  /**
   * Sets the personal volume for a given user.
   *
   * @param {string} userId - The ID of the user.
   * @param {number} volume - The volume to set, between 0.0 and 1.0.
   */
  setPersonalVolume(userId, volume) {
    if (volume > 1.0 || volume < 0.0) {
      console.error("Volume must be between 0.0 and 1.0", volume);
      volume = 1.0;
    }

    this.inputStreams.forEach((stream) => {
      if (stream.producerId === userId) {
        stream.personalGainNode.gain.value = volume;
      }
    });
  }

  /**
   * Mutes the outgoing stream by disabling all tracks.
   */
  mute() {
    if (this.outStream) {
      this.outStream.getTracks().forEach(track => track.enabled = false);
    }
    this.isMuted = true;
  }

  /**
   * Unmutes the outgoing stream by enabling all tracks.
   */
  unmute() {
    if (this.outStream) {
      this.outStream.getTracks().forEach(track => track.enabled = true);
    }
    this.isMuted = false;
  }

  /**
   * Mutes the incoming stream by setting the gain value of all deaf nodes to 0.0.
   */
  deaf() {
    this.isDeaf = true;
    this.inputStreams.forEach((stream) => {
      stream.deafNode.gain.value = 0.0;
    });
  }

  /**
   * Unmutes the incoming stream by setting the gain value of all deaf nodes to 1.0.
   * @function
   * @name mediasoupHandler#undeaf
   * @returns {void}
   */
  undeaf() {
    this.isDeaf = false;
    this.inputStreams.forEach((stream) => {
      stream.deafNode.gain.value = 1.0;
    });
  }

  /**
   * Closes the mediasoup handler by leaving the room, stopping the audio broadcast, and stopping consumption.
   */
  close() {
    this.leaveRoom();
    this.stopAudioBroadcast();
    this.stopConsuming();
  }

  /**
   * Returns an object containing the current audio state.
   * @returns {{
   *   isTransmitting: boolean,
   *   isMuted: boolean,
   *   isDeaf: boolean,
   *   volume: number,
   *   deviceId: string,
   *   outputDeviceId: string
   * }} The current audio state.
   */
  getAudioState() {
    return {
      isTransmitting: true,
      isMuted: this.isMuted,
      isDeaf: this.isDeaf,
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

  /**
   * Retrieves the available video sources and filters out those with invalid thumbnail sizes.
   * @returns {Promise<Array<Object>>} An array of video sources with valid thumbnail sizes.
   */
  static async getVideoSources() {
    const srcs = await ipcRenderer.invoke("getVideoSources");
    return srcs.filter((src) => {
      return (src.thumbnail.getSize().width > 0 && src.thumbnail.getSize().height > 0);
    });
  }

  /**
   * Returns a Promise that resolves to an object containing connection stats such as ping, bytes sent/received, packets sent/received, jitter, and packets lost.
   * @returns {Promise<{ping: number, bytesSent: number, bytesReceived: number, packetsSent: number, packetsReceived: number, jitterIn: number, packetsLostIn: number}>} A Promise that resolves to an object containing connection stats.
   */
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

export default mediasoupHandler;