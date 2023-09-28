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