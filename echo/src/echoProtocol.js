import mediasoupHandler from "./mediasoupHandler";
import Emitter from "wildemitter";

import Users from "./cache/user";
import Room from "./cache/room";

import { storage } from "./index";

const io = require("socket.io-client");

class EchoProtocol {
  constructor() {
    this.socket = null;
    this.ping = 0;
    this.pingInterval = null;
    this.mh = null;

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
      this.openConnection(storage.get("id"));
    }, 5000);
  }

  _makeIO(id) {
    this.socket = io(this.SERVER_URL, {
      path: "/socket.io",
      query: { id }
    });
  }

  getPing() {
    return new Promise((resolve, reject) => {
      if (this.mh) {
        this.mh.getConnectionStats().then(stats => {
          resolve(stats.ping);
        });
      }
    });
  }

  openConnection(id) {
    this._makeIO(id);
    this.startTransmitting(id);

    this.socket.on("server.ready", (remoteId) => {
    });

    this.socket.io.on("close", () => {
      this.rtcConnectionStateChange({ state: "disconnected" });
      this.localUserCrashed({ id: storage.get("id") });
    })

    this.socket.io.on("error", (error) => {
      console.error(error);
      alert("The audio server connection has errored out")
      this.stopTransmitting();
      this.stopReceiving();
      if (this.socket) {
        this.socket.close();
      }
      
      this.rtcConnectionStateChange({ state: "disconnected" });
    });

    this.socket.on("portalTurret.areYouStillThere?", (data) => {
      console.log("ping")
      this.socket.emit("client.thereYouAre");
    });

    this.socket.on("server.userJoinedChannel", (data) => {
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
      if (data.crashed) {
        console.log("User " + data.id + " crashed");
      }

      if (data.isConnected) this.stopReceiving(data.id);
      this.userLeftChannel(data);
    });

    this.socket.on("server.sendAudioState", (data) => {
      if (!data.deaf || !data.mute) {
        this.updatedAudioState(data);
        //startReceiving();
      }
    });

    this.socket.on("server.receiveChatMessage", (data) => {
      this.reciveChatMessageFromSocket(data);
    });

    this.socket.on("server.endConnection", (data) => {
      this.endConnection(data);
    });

    this.socket.on("server.userUpdated", (data) => {
      this.updateUser(data);
      // update rooms cache chat with new user data
      const rooms = this.cachedRooms.values();
      for (const room of rooms) {
        room.chat.updateUser(data);
        if (room.id === this.cachedUsers.get(storage.get("id")).currentRoom) this.messagesCacheUpdated(room.chat.get());
      }
      this.usersCacheUpdated(this.cachedUsers.get(id));
    });

    this.socket.on("server.videoBroadcastStarted", (data) => {
      this.updateUser({ id: data.id, field: "broadcastingVideo", value: true });
      this.videoBroadcastStarted(data);
    });

    this.socket.on("server.videoBroadcastStop", (data) => {
      this.updateUser({ id: data.id, field: "broadcastingVideo", value: false });
      this.videoBroadcastStop(data);
    });

    this.socket.on("server.receiveTransportCreated", (data) => {
      if (this.mh) {
        //Server will receive and what client sends
        this.mh.createSendTransport(data);
      }
    });

    this.socket.on("server.sendTransportCreated", (data) => {
      if (this.mh) {
        //Client will receive and what server sends
        this.mh.createReceiveTransport(data);
      }
    });

    this.socket.on("server.receiveVideoTransportCreated", (data) => {
      if (this.mh) {
        //Server will receive and what client sends
        this.mh.createSendVideoTransport(data);
      }
    });

    this.socket.on("server.sendVideoTransportCreated", (data) => {
      if (this.mh) {
        //Client will receive and what server sends
        this.mh.createReceiveVideoTransport(data);
      }
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
    if (this.mh) {
      this.stopTransmitting();
    }
    this.mh = new mediasoupHandler(
      id,
      storage.get('inputAudioDeviceId'),
      storage.get('outputAudioDeviceId'),
    );
    await this.mh.init();
  }

  stopTransmitting() {
    if (this.mh) {
      this.mh.close();
    }
  }

  sendTransportConnect(data, cb, errCb) {
    if (this.socket) {
      this.socket.emit("client.sendTransportConnect", data, (a) => {
        cb(a);
      });
    }
  }

  sendTransportProduce(data, cb, errCb) {
    if (this.socket) {
      this.socket.emit("client.sendTransportProduce", data, (a) => {
        cb(a);
      });
    }
  }

  receiveTransportConnect(data, cb, errCb) {
    if (this.socket) {
      this.socket.emit("client.receiveTransportConnect", data, (a) => {
        cb(a);
      });
    }
  }

  sendVideoTransportConnect(data, cb, errCb) {
    if (this.socket) {
      this.socket.emit("client.sendVideoTransportConnect", data, (a) => {
        cb(a);
      });
    }
  }

  sendVideoTransportProduce(data, cb, errCb) {
    if (this.socket) {
      this.socket.emit("client.sendVideoTransportProduce", data, (a) => {
        cb(a);
      });
    }
  }

  receiveVideoTransportConnect(data, cb, errCb) {
    if (this.socket) {
      this.socket.emit("client.receiveVideoTransportConnect", data, (a) => {
        cb(a);
      });
    }
  }

  startReceiving(remoteId) {
    this.subscribeAudio({ id: remoteId });
  }

  stopReceiving(remoteId) {
    if (this.mh) {
      this.mh.stopConsuming(remoteId);
    }
  }

  stopReceivingVideo(remoteId) {
    if (this.mh) {
      this.mh.stopConsumingVideo(remoteId);
      if (this.socket) {
        this.socket.emit("client.stopReceivingVideo", { id: remoteId });
      }
    }
  }

  toggleMute(mutestate) {
    if (this.mh) {
      if (mutestate) return this.mh.mute();
      this.mh.unmute();
    }
  }

  toggleDeaf(deafstate) {
    if (this.mh) {
      if (deafstate) return this.mh.deaf();
      this.mh.undeaf();
    }
  }

  setSpeakerDevice(deviceId) {
    this.mh.setSpeakerDevice(deviceId);
  }

  setSpeakerVolume(volume) {
    this.mh.setSpeakerVolume(volume);
  }

  setMicrophoneDevice(deviceId) {
    if (this.mh) {
      this.mh.setInputDevice(deviceId);
    }
  }

  setMicrophoneVolume(volume) {
    if (this.mh) {
      this.mh.setOutVolume(volume);
    }
  }

  setUserVolume(volume, remoteId) {
    this.mh.setPersonalVolume(remoteId, volume);
  }

  getSpeakerDevices() {
    return mediasoupHandler.getOutputAudioDevices();
  }

  getMicrophoneDevices() {
    return mediasoupHandler.getInputAudioDevices();
  }

  joinRoom(id, roomId) {
    const audioState = this.getAudioState();
    this.mh.startStatsInterval();
    // join the transmission on current room
    this.socket.emit("client.join", { id, roomId, deaf: audioState.isDeaf, muted: audioState.isMuted });
  }

  sendAudioState(id, data) {
    this.updatedAudioState({ id, deaf: data.deaf, muted: data.muted });
    if (this.socket) this.socket.emit("client.audioState", { id, deaf: data.deaf, muted: data.muted });
  }

  exitFromRoom(id) {
    this.stopScreenSharing();
    this.stopReceiving();
    this.stopReceivingVideo();
    this.mh.leaveRoom();
    this.exitedFromRoom();
    if (this.socket) this.socket.emit("client.exit", { id });
  }

  closeConnection(id = null) {
    if (this.socket) {
      if (!id) id = storage.get('id');
      this.socket.emit("client.end", { id });
      clearInterval(this.currentConnectionStateInterval);
    }

    this.stopReceiving();
    this.stopReceivingVideo();
    this.stopTransmitting();
    this.stopScreenSharing();

    this.socket = null;
    this.ping = 0;
    this.pingInterval = null;
    this.mh = null;

    this.cachedUsers = new Users();
    this.cachedRooms = new Map();

    this.currentConnectionState = "";
    this.currentConnectionStateInterval = null;

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

  subscribeAudio(data) {
    if (this.socket) {
      let remoteId = data.id;
      let a = this.mh.getRtpCapabilities()

      this.socket.emit("client.subscribeAudio", { id: remoteId, rtpCapabilities: a }, (data) => {
        this.mh.consume({
          id: data.id,
          producerId: data.producerId,
          kind: data.kind,
          rtpParameters: data.rtpParameters,
          type: data.type,
          producerPaused: data.producerPaused,
        });
      });
    }
  }
  resumeStream(data) {
    if (this.socket) {
      this.socket.emit("client.resumeStream", data);
    }
  }

  resumeStreams(data) {
    if (this.socket) {
      this.socket.emit("client.resumeStreams", data);
    }
  }

  unsubscribeAudio(data, cb) {
    if (this.socket) {
      this.socket.emit("client.unsubscribeAudio", data);
    }
  }

  stopAudioBroadcast(data) {
    if (this.socket) {
      this.socket.emit("client.stopAudioBroadcast", data);
    }
  }

  startScreenSharing(deviceId) {
    if (this.mh) {
      this.mh.setScreenShareDevice(deviceId);
      this.mh.startScreenShare();
    }
  }

  stopScreenSharing() {
    if (this.mh && this.mh.isScreenSharing()) {
      this.mh.stopScreenShare();
      this.socket.emit("client.stopScreenSharing", { id: storage.get("id") });
    }
  }

  startReceivingVideo(remoteId) {
    if (this.mh) {
      let a = this.mh.getRtpCapabilities()
      this.socket.emit("client.startReceivingVideo", { id: remoteId, rtpCapabilities: a }, (description) => {
        this.mh.consumeVideo(description);
      });
    }
  }

  resumeVideoStream(data) {
    if (this.socket) {
      this.socket.emit("client.resumeVideoStream", data);
    }
  }

  /**
   * @param {string} remoteId Id from the user to get the video stream from
   * @returns {MediaStream} Screen share stream
   */
  getVideo(remoteId) {
    if (this.mh) {
      let stream = this.mh.getVideo(remoteId);
      return stream;
    } else {
      console.error("VideoRtc not initialized");
    }
  }

  sendVideoStreamToFrontEnd(data) {
    this.gotVideoStream({
      user: this.cachedUsers.get(data.id),
      stream: data.stream,
    })
  }

  stopVideoBroadcast(data) {
    if (this.socket) {
      this.socket.emit("client.stopVideoBroadcast", data);
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
    return mediasoupHandler.getVideoSources();
  }

  getAudioState(id = false) {
    if (id && this.mh) {
      const cachedUser = this.cachedUsers.get(id);
      if (cachedUser && !cachedUser.self) {
        return {
          // TODO: implement user volume in cache
          isMuted: cachedUser.muted,
          isDeaf: cachedUser.deaf
        }
      }
    }
    return this.mh.getAudioState();
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
        if (room.id === this.cachedUsers.get(storage.get("id")).currentRoom) this.messagesCacheUpdated(room.chat.get());
      }
      this.usersCacheUpdated(this.cachedUsers.get(id));
    }
    else this.needUserCacheUpdate({ id, call: { function: "updateUser", args: { id, field, value } } });
  }

  getRoom(id) {
    if (typeof id !== "string") id = id.toString();
    return this.cachedRooms.get(id);
  }

  getUser(id) {
    if (id) {
      return this.cachedUsers.get(id);
    } else {
      return this.cachedUsers.get(storage.get("id"));
    }
  }

  getUsersInRoom(roomId) {
    return this.cachedUsers.getInRoom(roomId);
  }

  getScreenSharingUsersInRoom(roomId) {
    return this.cachedUsers.getScreenSharingUsersInRoom(roomId);
  }

  isAudioFullyConnected() {
    //return this.mh.isFullyConnected();
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
  this.updateUser({ id: data.id, field: "muted", value: data.muted });
  this.updateUser({ id: data.id, field: "deaf", value: data.deaf });
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

EchoProtocol.prototype.exitedFromRoom = function (data) {
  this.emit("exitedFromRoom", data);
}

EchoProtocol.prototype.gotVideoStream = function (data) {
  this.emit("gotVideoStream", data);
}

EchoProtocol.prototype.localUserCrashed = function (data) {
  this.emit("localUserCrashed", data);
}

export default EchoProtocol;