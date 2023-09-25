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
}

export default audioRtcTransmitter;