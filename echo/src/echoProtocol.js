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

    this.currentConnectionState = "";
    this.currentConnectionStateInterval = null;

    this.SERVER_URL = "https://echo.kuricki.com";
  }

  // TODO: make resubscribe users to rooms on reconnect
  _startReconnectTry() {
    this.currentConnectionStateInterval = setInterval(() => {
      if (this.currentConnectionState === "connected") {
        clearInterval(this.currentConnectionStateInterval);
        this.currentConnectionStateInterval = null;
        return;
      };
      this.openConnection(localStorage.getItem("id"));
    }, 5000);
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
      this.rtcConnectionStateChange({ state: "disconnected" });
      this.stopTransmitting();
      this.stopReceiving();
      this._startReconnectTry();
    })

    this.socket.io.on("error", (error) => {
      console.error(error);
      alert("The audio server connection has errored out")
      this.stopTransmitting();
      this.stopReceiving();
      this.socket.close();
      this.rtcConnectionStateChange({ state: "disconnected" });
      this._startReconnectTry();
    });

    this.socket.on("server.userJoinedChannel", (data) => {
      console.log("User", data.id, "joined your channel, starting listening audio", data);
      if (data.isConnected) this.startReceiving(data.id);
      this.updateUser({ id: data.id, field: "currentRoom", value: data.roomId });
      this.updateUser({ id: data.id, field: "muted", value: data.muted });
      this.updateUser({ id: data.id, field: "deaf", value: data.deaf });
      if (data.broadcastingVideo) {
        this.videoBroadcastStarted({ id: data.id, streamId: null });
      }
      this.userJoinedChannel(data);
      // render the component Room with the new user
    });

    this.socket.on("server.userLeftChannel", (data) => {
      console.log("User", data.id, "left your channel, stopping listening audio", data);
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
      this.reciveChatMessageFromSocket(data);
    });

    this.socket.on("server.endConnection", (data) => {
      console.log("User", data.id, "closed the connection");
      this.endConnection(data);
    });

    this.socket.on("server.userUpdated", (data) => {
      console.log("User", data.id, "updated his data", data);
      this.updateUser(data);
      // update rooms cache chat with new user data
      const rooms = this.cachedRooms.values();
      for (const room of rooms) {
        room.chat.updateUser(data);
        if (room.id === this.cachedUsers.get(localStorage.getItem("id")).currentRoom) this.messagesCacheUpdated(room.chat.get());
      }
      this.usersCacheUpdated(this.cachedUsers.get(id));
    });

    this.socket.on("server.videoBroadcastStarted", (data) => {
      console.log("User", data.id, "started broadcasting video", data.streamId);
      this.videoBroadcastStarted(data);
    });

    this.socket.on("server.videoBroadcastStop", (data) => {
      console.log("User", data.id, "stopped broadcasting video", data.streamId);
      this.videoBroadcastStop(data);
    });
  }

  endConnection(data) {
    // this.cachedUsers.delete(data.id);
    this.userLeftChannel(data);
  }

  reciveChatMessageFromSocket(data) {
    if (typeof data.roomId !== "string") data.roomId = data.roomId.toString();
    if (typeof data.id !== "string") data.id = data.id.toString();
    if (typeof data.userId !== "string") data.userId = data.id;
    // check if the room is cached
    const room = this.cachedRooms.get(data.roomId);
    if (room) {
      const user = this.cachedUsers.get(data.id);
      if (user) {
        console.log("got message chat from socket", data)
        data.userId = user.id;
        data.img = user.userImage;
        data.name = user.name;
        const newMessage = room.chat.add(data);
        this.receiveChatMessage(newMessage);
      }
      else this.needUserCacheUpdate({ id: data.id, call: { function: "reciveChatMessageFromSocket", args: data } });
    } else console.error("Room not found in cache");
  }

  async startTransmitting(id) {
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
      this.vt.stopSharing();
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

  stopReceivingVideo(remoteId) {
    if(this.vt) {
      this.vt.unsubscribeFromVideo(remoteId);
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
      this.at.setInputDevice(deviceId);
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
    const audioState = this.getAudioState();
    this.at.startStatsInterval();
    // join the transmission on current room
    this.socket.emit("client.join", { id, roomId, deaf: audioState.isDeaf, muted: audioState.isMuted });
  }

  sendAudioState(id, data) {
    this.updatedAudioState({ id, deaf: data.deaf, muted: data.muted });
    if (this.socket) this.socket.emit("client.audioState", { id, deaf: data.deaf, muted: data.muted });
  }

  exitFromRoom(id) {
    this.stopReceiving();
    this.stopReceivingVideo();
    if (this.socket) this.socket.emit("client.exit", { id });
  }

  closeConnection(id = null) {
    if (this.socket) {
      if (!id) id = localStorage.getItem('id');
      console.log("closing connection with socket")
      this.socket.emit("client.end", { id });
    }

    this.stopReceiving();
    this.stopReceivingVideo();
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

  streamChanged(data) {
    if (this.socket) {
      this.socket.emit("client.streamChanged", data);
    }
  }

  videoStreamChanged(data) {
    if (this.socket) {
      this.socket.emit("client.videoStreamChanged", data);
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
    if (this.vt) {
      this.vt.setDevice(deviceId);
      this.vt.startSharing();
    }
  }

  stopScreenSharing() {
    if (this.vt) {
      this.vt.stopSharing();
    }
  }

  startReceivingVideo(remoteId) {
    if (this.vt) {
      this.vt.subscribeToVideo(remoteId);
    }
  }

  getScreenShareStream(remoteId) {
    if (this.vt) return this.vt.getScreenShareStream(remoteId);
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
      console.log("User", data.id, "stopped broadcasting video", data.streamId)
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

  updatePersonalSettings({ id, field, value }) {
    if (this.cachedUsers.get(id)) {
      this.socket.emit("client.updateUser", { id, field, value });
      this.updateUser({ id, field, value });
    }
  }


  updateUser({ id, field, value }) {
    if (this.cachedUsers.get(id)) {
      this.cachedUsers.update(id, field, value);
      const rooms = this.cachedRooms.values();
      for (const room of rooms) {
        room.chat.updateUser({ id, field, value });
        if (room.id === this.cachedUsers.get(localStorage.getItem("id")).currentRoom) this.messagesCacheUpdated(room.chat.get());
      }
      this.usersCacheUpdated(this.cachedUsers.get(id));
    }
    else this.needUserCacheUpdate({ id, call: { function: "updateUser", args: { id, field, value } } });
  }

  getUser(id) {
    return this.cachedUsers.get(id);
  }

  getUsersInRoom(roomId) {
    return this.cachedUsers.getInRoom(roomId);
  }

  isAudioFullyConnected() {
    //return this.at.isFullyConnected();
    return true;
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

  setMessagesCache({ messages, roomId }) {
    if (typeof roomId !== "string") roomId = roomId.toString();
    // extract all userId from the messages array and remove duplicates
    const userIds = [];
    messages.forEach((message) => {
      if (typeof message.userId !== "string") message.userId = message.userId.toString();
      userIds.push(message.userId);
    });
    const uniqueUserIds = [...new Set(userIds)];
    if (uniqueUserIds.length === 0) return this.messagesCacheUpdated([]);
    uniqueUserIds.forEach((userId) => {
      const room = this.cachedRooms.get(roomId);
      if (room) {
        const user = this.cachedUsers.get(userId);
        if (user) {
          room.chat.clear();
          messages.forEach((message) => {
            if (typeof message.userId !== "string") message.userId = message.userId.toString();
            if (message.userId === user.id) {
              message.img = user.img || user.userImage;
              message.name = user.name;
            }
            room.chat.add(message)
          });
          this.messagesCacheUpdated(room.chat.get());
        } else {
          console.error("User not found in cache");
          this.needUserCacheUpdate({ id: userId, call: { function: "setMessagesCache", args: { messages, roomId } } });
          this.messagesCacheUpdated([]);
          return;
        }
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

EchoProtocol.prototype.rtcConnectionStateChange = function (data) {
  this.currentConnectionState = data.state;
  this.emit("rtcConnectionStateChange", data);
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

EchoProtocol.prototype.audioStatsUpdate = function (data) {
  this.emit("audioStatsUpdate", data);
}

EchoProtocol.prototype.videoBroadcastStarted = function (data) {
  this.emit("videoBroadcastStarted", data);
}

EchoProtocol.prototype.videoBroadcastStop = function (data) {
  this.emit("videoBroadcastStop", data);
}

export default EchoProtocol;