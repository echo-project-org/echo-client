import audioRtcTransmitter from "./audioRtcTransmitter";
import Emitter from "wildemitter";
import videoRtc from "./videoRtc";

import Users from "./cache/user";
import Room from "./cache/room";

const io = require("socket.io-client");

class EchoProtocol {
  constructor() {
    this.socket = null;
    this.ping = 0;
    this.pingInterval = null;
    this.at = null;
    this.vt = null;

    this.cachedUsers = new Users();
    this.cachedRooms = new Map();

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
    this.setupVideoRtc(id);

    this._startPing();

    this.socket.on("server.ready", (remoteId) => {
      console.log("Websocker connection opened", remoteId);
    });

    this.socket.io.on("close", () => {
      console.log("Websocket connection closed");
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
      console.log("User", data.id, "joined your channel, starting listening audio");
      if (data.isConnected) this.startReceiving(data.id);
      this.userJoinedChannel(data);
      // render the component Room with the new user
    });

    this.socket.on("server.userLeftChannel", (data) => {
      console.log("User", data.id, "left your channel, stopping listening audio");
      if (data.isConnected) this.stopReceiving(data.id);
      this.userLeftChannel(data);
    });

    this.socket.on("server.sendAudioState", (data) => {
      console.log("Got user audio state from server", data);
      if (!data.deaf || !data.mute) {
        this.updatedAudioState(data);
        //startReceiving();
      }
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

    this.socket.on("server.videoRenegotiationNeeded", (data, cb) => {
      if (this.vt) {
        this.vt.renegotiate(data.data.sdp, cb);
      }
    });

    this.socket.on("server.receiveChatMessage", (data) => {
      if (typeof data.roomId !== "string") data.roomId = data.roomId.toString();
      if (typeof data.userId !== "string") data.userId = data.id.toString();
      if (typeof data.id !== "string") data.id = data.id.toString();
      // check if the room is cached
      const room = this.cachedRooms.get(data.roomId);
      if (room) {
        const user = this.cachedUsers.get(data.id);
        if (user) {
          console.log("got message chat from socket", data)
          data.img = user.userImage;
          data.name = user.name;
          const newMessage = room.chat.add(data);
          this.receiveChatMessage(newMessage);
        }
        else this.needUserCacheUpdate(data.id);
      } else console.error("Room not found in cache");
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

    if (this.vt) {
      this.vt.close();
      this.vt = null;
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
    // join the transmission on current room
    this.socket.emit("client.join", { id, roomId });
    this.startReceivingVideo(1);
  }

  sendAudioState(id, data) {
    this.updatedAudioState({ id, deaf: data.deaf, muted: data.muted });
    if (this.socket) this.socket.emit("client.audioState", { id, deaf: data.deaf, muted: data.muted });
  }

  exitFromRoom(id) {
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

  setupVideoRtc(id) {
    this.vt = new videoRtc(id);
  }

  startScreenSharing(deviceId) {
    this.vt.setDevice(deviceId);
    this.vt.startSharing();
  }

  stopScreenSharing() {
    this.vt.stopSharing();
  }

  startReceivingVideo(remoteId) {
    this.vt.subscribeToVideo(remoteId);
  }

  /**
   * @param {string} remoteId Id from the user to get the video stream from
   * @returns {MediaStream} Screen share stream
   */
  getVideo(remoteId) {
    let stream = this.vt.getVideo(remoteId);
    console.log("Got video stream", stream);
    return stream;
  }

  negotiateVideoRtc(data, cb) {
    if (this.socket) {
      this.socket.emit("client.negotiateVideoRtc", data, (description) => {
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

  getAudioState(id = false) {
    if (id) {
      const cachedUser = this.cachedUsers.get(id);
      if (cachedUser && !cachedUser.self) {
        return {
          // TODO: implement user volume in cache
          isMuted: cachedUser.muted,
          isDeaf: cachedUser.deaf
        }
      }
    }
    return this.at.getAudioState();
  }

  // cache rooms functions
  addRoom(room) {
    if (typeof room.id !== "string") room.id = room.id.toString();
    this.cachedRooms.set(room.id, new Room(room));
  }

  updateRoom(id, field, value) {
    const room = this.cachedRooms.get(id);
    if (room)
      if (room["update" + field]) room["update" + field](value);
      else console.error("Room does not have field " + field + " or field function update" + field);
    else console.error("Room not found in cache");
  }

  // cache users functions
  addUser(user, self = false) {
    this.cachedUsers.add(user, self);
    this.usersCacheUpdated(this.cachedUsers.get(user.id));
  }

  updateUser(id, field, value) {
    if (this.cachedUsers.get(id)) {
      this.cachedUsers.update(id, field, value);
      this.usersCacheUpdated(this.cachedUsers.get(id));
    }
    else this.needUserCacheUpdate(id);

  }

  getUser(id) {
    return this.cachedUsers.get(id);
  }

  getUsersInRoom(roomId) {
    return this.cachedUsers.getInRoom(roomId);
  }

  checkUserCache(id) {
    if (this.cachedUsers.get(id)) return Promise.resolve(this.cachedUsers.get(id));
    else return this.needUserCacheUpdate(id);
  }

  isAudioFullyConnected() {
    return this.at.isFullyConnected();
  }

  // chat messages function
  sendChatMessage(data) {
    if (typeof data.roomId !== "string") data.roomId = data.roomId.toString();
    if (typeof data.userId !== "string") data.userId = data.userId.toString();
    const room = this.cachedRooms.get(data.roomId);
    if (room) {
      if (this.socket) this.socket.emit("client.sendChatMessage", { ...data, id: data.userId });
      else console.error("Socket not found");
    }
    else console.error("Room not found in cache");
  }

  setMessagesCache(messages, roomId) {
    // extract all userId from the messages array and remove duplicates
    const userIds = [];
    messages.forEach((message) => {
      if (typeof message.userId !== "string") message.userId = message.userId.toString();
      userIds.push(message.userId);
    });
    const uniqueUserIds = [...new Set(userIds)];
    if (uniqueUserIds.length === 0) return this.messagesCacheUpdated([]);
    uniqueUserIds.forEach(async (userId) => {
      const user = this.checkUserCache(userId)
      if (typeof roomId !== "string") roomId = roomId.toString();
      const room = this.cachedRooms.get(roomId);
      if (room) {
        messages.forEach((message) => {
          if (typeof message.userId !== "string") message.userId = message.userId.toString();
          if (message.userId === user.id) {
            message.img = user.img;
            message.name = user.name;
          }
          room.chat.add(message)
        });
        this.messagesCacheUpdated(room.chat.get());
      } else {
        console.error("Room not found in cache");
        this.messagesCacheUpdated([]);
      }
    });
  }

  checkMessagesCache(roomId) {
    return new Promise((resolve, reject) => {
      if (typeof roomId !== "string") roomId = roomId.toString();
      const room = this.cachedRooms.get(roomId);
      if (room) {
        if (!room.chat.cached) return reject("Room chat not cached");
        resolve(room.chat.get());
      }
      else reject("Room not found in cache");
    });
  }
}

Emitter.mixin(EchoProtocol);


EchoProtocol.prototype.roomClicked = function (data) {
  this.emit("roomClicked", data);
}

EchoProtocol.prototype.usersCacheUpdated = function (data) {
  this.emit("usersCacheUpdated", data);
}

EchoProtocol.prototype.updatedAudioState = function (data) {
  this.emit("updatedAudioState", data);
}

EchoProtocol.prototype.userJoinedChannel = function (data) {
  this.emit("userJoinedChannel", data);
}

EchoProtocol.prototype.userLeftChannel = function (data) {
  this.emit("userLeftChannel", data);
}

EchoProtocol.prototype.receiveChatMessage = function (data) {
  this.emit("receiveChatMessage", data);
}

EchoProtocol.prototype.messagesCacheUpdated = function (data) {
  this.emit("messagesCacheUpdated", data);
}

EchoProtocol.prototype.needUserCacheUpdate = function (data) {
  this.emit("needUserCacheUpdate", data);
}

export default EchoProtocol;