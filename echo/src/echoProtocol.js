import audioRtcTransmitter from "./audioRtcTransmitter";
import Emitter from "wildemitter";
import videoRtc from "./videoRtc";

const io = require("socket.io-client");

class EchoProtocol {
  constructor() {
    console.log("created echoProtocol")

    this.socket = null;
    this.ping = 0;
    this.pingInterval = null;
    this.at = null;

    this.SERVER_URL = "https://echo.kuricki.com";
  }

  _makeIO(id) {
    this.socket = io(this.SERVER_URL, {
      path: "/socket.io",
      query: { id }
    });
  }

  _startPing() {
    this.pingInterval = setInterval(() => {
      const start = Date.now();

      this.socket.emit("client.ping", () => {
        const duration = Date.now() - start;
        this.ping = duration;
      });
    }, 5000);
  }

  getPing() {
    return new Promise((resolve, reject) => {
      if (this.at) {
        this.at.getConnectionStats().then(stats => {
          resolve(stats.ping);
        });
      }
    });
  }

  openConnection(id) {
    this._makeIO(id);
    this.startTransmitting(id);

    this._startPing();

    this.socket.on("server.ready", (remoteId) => {
      console.log("opened", remoteId);
    });

    this.socket.io.on("close", () => {
      console.log("connection closed");
      this.stopTransmitting();
      this.stopReceiving();
    })

    this.socket.io.on("error", (error) => {
      console.error(error);
      alert("The audio server connection has errored out")
      this.stopTransmitting();
      this.stopReceiving();
      this.socket.close();
    });

    this.socket.on("server.userJoinedChannel", (data) => {
      console.log("user", data.id, "joined your channel, starting listening audio");
      this.startReceiving(data.id);
      this.emit("server.userJoinedChannel", data);
      // render the component Room with the new user
    });

    this.socket.on("server.sendAudioState", (data) => {
      console.log("got user audio info from server", data);
      if (!data.deaf || !data.mute) {
        this.updatedAudioState(data);
        //startReceiving();
      }
    });

    this.socket.on("server.userLeftChannel", (data) => {
      console.log("user", data.id, "left your channel, stopping listening audio");
      this.stopReceiving(data.id);
    });

    this.socket.on("server.iceCandidate", (data) => {
      if (this.at) {
        this.at.addCandidate(data.candidate);
      }
    });

    this.socket.on("server.renegotiationNeeded", (data, cb) => {
      if (this.at) {
        this.at.renegotiate(data.data.sdp, cb);
      }
    });
  }

  async startTransmitting(id = 5) {
    if (this.at) {
      this.stopTransmitting();
    }
    this.at = new audioRtcTransmitter(id);
    await this.at.init();
  }

  stopTransmitting() {
    if (this.at) {
      this.at.close();
      this.at = null;
    }
  }

  startReceiving(remoteId) {
    console.log("Starting input stream for", remoteId)
    this.at.subscribeToAudio(remoteId);
  }

  stopReceiving(remoteId) {
    if (this.at) {
      this.at.unsubscribeFromAudio(remoteId);
    }
  }

  toggleMute(mutestate) {
    if (this.at) {
      if (mutestate) return this.at.mute();
      this.at.unmute();
    }
  }

  toggleDeaf(deafstate) {
    if (this.at) {
      if (deafstate) return this.at.deaf();
      this.at.undeaf();
    }
  }

  setSpeakerDevice(deviceId) {
    this.at.setOutputDevice(deviceId);
  }

  setSpeakerVolume(volume) {
    this.at.setOutputVolume(volume);
  }

  setMicrophoneDevice(deviceId) {
    if (this.at) {
      this.at.close();
      this.at = new audioRtcTransmitter(deviceId);
    }
  }

  setMicrophoneVolume(volume) {
    if (this.at) {
      this.at.setVolume(volume);
    }
  }

  setUserVolume(volume, remoteId) {
    this.at.setPersonalVolume(volume, remoteId);
  }

  getSpeakerDevices() {
    return audioRtcTransmitter.getOutputAudioDevices();
  }

  getMicrophoneDevices() {
    return audioRtcTransmitter.getInputAudioDevices();
  }

  joinRoom(id, roomId) {
    console.log("joining event called", id, roomId)
    // join the transmission on current room
    this.socket.emit("client.join", { id, roomId });
    //startReceiving(1);
  }

  sendAudioState(id, data) {
    if (this.socket) this.socket.emit("client.audioState", { id, deaf: data.deaf, muted: data.muted });
  }

  exitFromRoom(id) {
    console.log("exit from room", id)
    this.stopReceiving();
    if (this.socket) this.socket.emit("client.exit", { id });
  }

  closeConnection(id = null) {
    if (this.socket) {
      if (!id) id = localStorage.getItem('id');
      console.log("closing connection with socket")
      this.socket.emit("client.end", { id });
    }

    this.stopReceiving();
    this.stopTransmitting();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    clearInterval(this.pingInterval);
    // if we let client handle disconnection, then recursive happens cause of the event "close"
    // socket.close();
  }

  broadcastAudio(data, cb) {
    if (this.socket) {
      this.socket.emit("client.broadcastAudio", data, (description) => {
        cb(description);
      });
    }
  }

  subscribeAudio(data, cb) {
    if (this.socket) {
      this.socket.emit("client.subscribeAudio", data, (description) => {
        cb(description);
      });
    }
  }

  unsubscribeAudio(data, cb) {
    if (this.socket) {
      this.socket.emit("client.unsubscribeAudio", data, (description) => {
        cb(description);
      });
    }
  }

  stopAudioBroadcast(data) {
    if (this.socket) {
      this.socket.emit("client.stopAudioBroadcast", data);
    }
  }

  sendIceCandidate(data) {
    if (this.socket) {
      this.socket.emit("client.iceCandidate", data);
    }
  }

  sendVideoIceCandidate(data) {
    if (this.socket) {
      this.socket.emit("client.videoIceCandidate", data);
    }
  }

  broadcastVideo(data, cb) {
    if (this.socket) {
      this.socket.emit("client.broadcastVideo", data, (description) => {
        cb(description);
      });
    }
  }

  stopVideoBroadcast(data) {
    if (this.socket) {
      this.socket.emit("client.stopVideoBroadcast", data);
    }
  }

  subscribeVideo(data, cb) {
    if (this.socket) {
      this.socket.emit("client.subscribeVideo", data, (description) => {
        cb(description);
      });
    }
  }

  unsubscribeVideo(data, cb) {
    if (this.socket) {
      this.socket.emit("client.unsubscribeVideo", data, (description) => {
        cb(description);
      });
    }
  }

  getVideoDevices() {
    return videoRtc.getVideoSources();
  }
}

Emitter.mixin(EchoProtocol);

EchoProtocol.prototype.updatedAudioState = function (data) {
  this.emit("updatedAudioState", data);
}

EchoProtocol.prototype.userJoinedChannel = function (data) {
  this.emit("userJoinedChannel", data);
}

export default EchoProtocol;