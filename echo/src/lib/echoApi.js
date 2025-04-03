import mediasoupHandler from "@lib/mediasoup/MediasoupHandler";
import { initCommunication, verifyCommunication } from "@lib/auth";

import Users from "@cache/user";
import Room from "@cache/room";
import Friends from "@cache/friends";

import { storage } from "@root/index";

const { error, warn, log } = require("@lib/logger");

class EchoFriendsAPI {
  constructor() {
    this.cachedFriends = new Friends();
  }

  addFriend(friend) {
    log("[FriendsManager] addFriend", friend);
    // if (typeof friend.targetId !== "string") friend.targetId = Number(friend.targetId);
    // populate info with cached user data
    if (!friend.name && !friend.img) {
      const user = this.cachedUsers.get(friend.targetId);
      log("user", user);
      if (user) {
        friend.img = user.img || user.userImage;
        friend.name = user.name;
        friend.status = user.status;
        friend.online = user.online;
      } else {
        error(`User ${friend.targetId} not found in cache, adding to cache...`)
        this.needUserCacheUpdate({ id: friend.targetId, call: { function: "addFriend", args: friend } });
      }
    }
    friend.id = friend.targetId;
    this.cachedFriends.add(friend);
    this.friendCacheUpdated(this.cachedFriends.getAll());
  }

  updateFriends({ id, field, value }) {
    this.cachedFriends.update(id, field, value);
    this.friendCacheUpdated(this.cachedFriends.getAll());
  }

  removeFriend(data) {
    log("ep.removeFriend", data);
    this.cachedFriends.remove(data.targetId);
    this.friendCacheUpdated(this.cachedFriends.getAll());
  }

  getFriend(id) {
    let friend = this.cachedFriends.get(id);
    let userFriend = this.cachedUsers.get(id);
    if (friend && userFriend) {
      return userFriend;
    } else {
      // this.needUserCacheUpdate({ id, call: { function: "getFriend", args: { id } } });
      warn("Friend not found in cache, probably offline and we don't handle it, ID:", id)
    }
  }

  wsFriendAction(data) {
    log("wsFriendAction", data)

    if (data.operation === "add") {
      this.addFriend(data);
    } else if (data.operation === "remove") {
      this.removeFriend(data);
    }
  }
}

/* class EchoWSApi extends EchoFriendsAPI {
  constructor() {
    super();
    this.wsConnection = new wsConnection();

    this.currentConnectionState = "";
    this.currentConnectionStateInterval = null;
  }

  sendToSocket(endpoing, data, cb) {
    if (this.wsConnection) {
      this.wsConnection.send(endpoing, data, (a) => {
        if (cb) {
          cb(a);
        }
      });
    }
  }

  wsConnectionClosed() {
    this.rtcConnectionStateChange({ state: "disconnected" });
    this.localUserCrashed({ id: sessionStorage.getItem("id") });
  }

  wsConnectionError(error) {
    error(error);
    alert("Can't conect to the server! \nCheck your internet connection (or the server is down). \n\nIf your internet connection is working try pinging echo.kuricki.com, if it doesn't respond, contact Kury or Thundy :D");
    this.stopTransmitting();
    this.stopReceiving();
    if (this.wsConnection) {
      this.wsConnection.close();
    }

    this.rtcConnectionStateChange({ state: "disconnected" });
    this.localUserCrashed({ id: sessionStorage.getItem("id") });
  }

  wsUserJoinedChannel(data) {
    data.roomId = data.roomId.slice(0, data.roomId.lastIndexOf('@'));
    log(data);
    if (data.isConnected) this.startReceiving(data.id);
    this.updateUser({ id: data.id, field: "currentRoom", value: data.roomId });
    this.updateUser({ id: data.id, field: "muted", value: data.muted });
    this.updateUser({ id: data.id, field: "deaf", value: data.deaf });
    this.updateUser({ id: data.id, field: "broadcastingVideo", value: data.broadcastingVideo });
    if (data.broadcastingVideo) {
      this.videoBroadcastStarted({ id: data.id, streamId: null });
    }
    this.userJoinedChannel(data);
  }

  wsRoomHasTheseUsers(data) {
    log("wsRoomHasTheseUsers", data)
    data.forEach(user => {
      user.roomId = user.roomId.slice(0, user.roomId.lastIndexOf('@'));
      if (user.isConnected) this.startReceiving(user.id);
      this.updateUser({ id: user.id, field: "currentRoom", value: user.roomId });
      this.updateUser({ id: user.id, field: "broadcastingVideo", value: user.broadcastingVideo });

      this.updatedAudioState({ id: user.id, deaf: user.deaf, muted: user.muted });
      data.roomId = user.roomId;

      if (user.broadcastingVideo) {
        this.videoBroadcastStarted({ id: user.id, streamId: null , silent: true});
      }
    });

    this.userJoinedChannel(data)
  }

  wsUserLeftChannel(data) {
    if (data.crashed) {
      log("User " + data.id + " crashed");
    }

    if (data.isConnected) this.stopReceiving(data.id);
    this.userLeftChannel(data);
  }

  wsSendAudioState(data) {
    if (!data.deaf || !data.mute) {
      this.updatedAudioState(data);
    }
  }

  wsUserUpdated(data) {
    this.updateUser(data);
    // update rooms cache chat with new user data
    const rooms = this.cachedRooms.values();
    for (const room of rooms) {
      room.chat.updateUser(data);
      if (room.id === this.cachedUsers.get(sessionStorage.getItem("id")).currentRoom) this.messagesCacheUpdated(room.chat.get());
    }
    this.usersCacheUpdated(this.cachedUsers.get(this.id));
  }

  wsVideoBroadcastStarted(data) {
    this.updateUser({ id: data.id, field: "broadcastingVideo", value: true });
    this.videoBroadcastStarted(data);
  }

  wsBroadcastNowHasAudio(data) {
    this.updateUser({ id: data.id, field: "videoBroadcastHasAudio", value: true });
    this.videoBroadcastHasAudio(data);
  }

  wsVideoBroadcastStop(data) {
    log("wsVideoBroadcastStop", data);
    this.updateUser({ id: data.id, field: "broadcastingVideo", value: false });
    this.videoBroadcastStop(data);
  }

  wsReceiveTransportCreated(data) {
    if (this.mh) {
      //Server will receive and what client sends
      this.mh.createSendTransport(data);
    }
  }

  wsSendTransportCreated(data) {
    if (this.mh) {
      //Client will receive and what server sends
      this.mh.createReceiveTransport(data);
    }
  }

  wseReceiveVideoTransportCreated(data) {
    if (this.mh) {
      //Server will receive and what client sends
      this.mh.createSendVideoTransport(data);
    }
  }

  wsSendVideoTransportCreated(data) {
    if (this.mh) {
      //Client will receive and what server sends
      this.mh.createReceiveVideoTransport(data);
    }
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
    this.id = id;
    if (!this.wsConnection) {
      this.wsConnection = new wsConnection();
    }
    this.wsConnection.connect(storage.get('token'));
    this.startTransmitting(id);
  }

  endConnection(data) {
    // this.cachedUsers.delete(data.id);
    this.userLeftChannel(data);
  }

  wsReceiveChatMessage(data) {
    log("wsReceiveChatMessage", data)
    if (typeof data.room !== "string") data.room = data.room.toString();
    if (typeof data.id !== "string") data.id = data.id.toString();
    if (typeof data.userId !== "string") data.userId = data.id;

    // check if the room is cached
    const room = this.cachedRooms.get(data.room);
    if (room) {
      const user = this.cachedUsers.get(data.id);
      if (user) {
        data.userId = user.id;
        data.img = user.userImage;
        data.name = user.name;
        const newMessage = room.chat.add(data);
        newMessage.roomId = data.room;
        this.receiveChatMessage(newMessage);
      }
      else this.needUserCacheUpdate({ id: data.id, call: { function: "wsReceiveChatMessage", args: data } });
    } else error("Room not found in cache");
  }

  closeConnection(id = null) {
    if (!id) id = sessionStorage.getItem('id');
    this.sendToSocket("end", { id });
    clearInterval(this.currentConnectionStateInterval);

    this.stopReceiving();
    this.stopReceivingVideo();
    this.stopTransmitting();
    this.stopScreenSharing();

    this.wsConnection = null;
    this.mh = new mediasoupHandler(
      storage.get('inputAudioDeviceId'),
      storage.get('outputAudioDeviceId'),
      storage.get('micVolume'),
      storage.get('noiseSuppression') === 'true' || false,
      storage.get('echoCancellation') === 'true' || false,
      storage.get('autoGainControl') === 'true' || false,
    );

    this.cachedUsers = new Users();
    this.cachedRooms = new Map();

    this.currentConnectionState = "";
    this.currentConnectionStateInterval = null;

    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }
}*/

class EchoAPI extends EchoFriendsAPI {
  constructor() {
    super();

    this.mh = null;
    this.id = null;

    this.cachedUsers = new Users();
    this.cachedRooms = new Map();

    this.mh = new mediasoupHandler(
      storage.get('inputAudioDeviceId'),
      storage.get('outputAudioDeviceId'),
      storage.get('micVolume'),
      storage.get('noiseSuppression') === 'true' || false,
      storage.get('echoCancellation') === 'true' || false,
      storage.get('autoGainControl') === 'true' || false,
    );

    this.mh.init();

    log("[EchoAPI] Initializing EchoAPI");
    
    initCommunication()
      .then(result => {
        if (result && result.publicKey && result.encrypted) {
          verifyCommunication(result)
            .then(data => {
              log("[EchoFriendsAPI] Communication verified", data);
            })
            .catch(error => {
              error("Error verifying communication", error);
            });
        }
      })
      .catch(error => {
        error("Error initializing communication", error);
      });
  }

  async startTransmitting(id) {
    if (this.mh) {
      this.stopTransmitting();
    }

    this.mh = new mediasoupHandler(
      id,
      storage.get('inputAudioDeviceId'),
      storage.get('outputAudioDeviceId'),
      storage.get('micVolume'),
      storage.get('noiseSuppression') === 'true' || false,
      storage.get('echoCancellation') === 'true' || false,
      storage.get('autoGainControl') === 'true' || false,
    );
    await this.mh.init();
  }

  stopTransmitting() {
    if (this.mh) {
      this.mh.close();
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

  setEchoCancellation(value) {
    if (this.mh) {
      this.mh.setEchoCancellation(value);
    }
  }

  setNoiseSuppression(value) {
    if (this.mh) {
      this.mh.setNoiseSuppression(value);
    }
  }

  setAutoGainControl(value) {
    if (this.mh) {
      this.mh.setAutoGainControl(value);
    }
  }

  setMicrophoneVolume(volume) {
    if (this.mh) {
      this.mh.setOutVolume(volume);
    }
  }

  setVadTreshold(treshold) {
    if (this.mh) {
      this.mh.setVadTreshold(treshold);
    }
  }

  setMicrophoneTest(value) {
    if (this.mh) {
      this.mh.setMicrophoneTest(value);
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
    this.sendToSocket("join", {
      serverId: storage.get('serverId'),
      id,
      roomId,
      deaf: audioState.isDeaf,
      muted: audioState.isMuted
    });

    // event to signal other components that i joined the room
    this.joinedRoom();
  }

  sendAudioState(id, data) {
    this.updatedAudioState({ id, deaf: data.deaf, muted: data.muted });
    this.sendToSocket("audioState", {
      id,
      deaf: data.deaf,
      muted: data.muted
    });
  }

  exitFromRoom(id) {
    this.stopScreenSharing();
    this.stopReceiving();
    this.stopReceivingVideo();
    this.mh.leaveRoom();
    this.exitedFromRoom();
  }

  subscribeAudio(data) {
    if (this.wsConnection) {
      let remoteId = data.id;
      let a = this.mh.getRtpCapabilities()

      this.sendToSocket("subscribeAudio", { id: remoteId, rtpCapabilities: a }, (data) => {
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

  startScreenSharing(deviceId) {
    if (this.mh) {
      this.mh.setScreenShareDevice(deviceId);
      this.mh.startScreenShare();
    }
  }

  stopScreenSharing() {
    const id = sessionStorage.getItem("id");
    if (!id) return error("No id found in session storage");
    this.updateUser({ id, field: "screenSharing", value: false });
    if (this.mh && this.mh.isScreenSharing()) {
      this.mh.stopScreenShare();
    }
  }

  startReceivingVideo(remoteId) {
    if (this.mh) {
      //check if im already the stream
      if (this.mh.checkIncomingVideo(remoteId)) {
        //already receiving stream
        this.sendVideoStreamToFrontEnd({ id: remoteId, stream: this.mh.getVideo() });
      } else {
        let a = this.mh.getRtpCapabilities()
        if (this.wsConnection) {
          this.sendToSocket("startReceivingVideo", { id: remoteId, rtpCapabilities: a }, (description) => {
            this.mh.consumeVideo(description);
          });
        }
      }
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
      error("VideoRtc not initialized");
    }
  }

  sendVideoStreamToFrontEnd(data) {
    this.gotVideoStream({
      user: this.cachedUsers.get(data.id),
      stream: data.stream,
    })
  }

  getVideoDevices() {
    return mediasoupHandler.getVideoSources();
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
    if (this.mh) {
      return this.mh.getAudioState();
    }

    return {
      isMuted: false,
      isDeaf: false
    }
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
      else error("Room does not have field " + field + " or field function update" + field);
    else error("Room not found in cache");
  }

  // cache users functions
  addUser(user, self = false) {
    log("adduser", user)
    this.cachedUsers.add(user, self);
    this.usersCacheUpdated(this.cachedUsers.get(user.id));
  }

  updatePersonalSettings({ id, field, value }) {
    if (this.cachedUsers.get(id)) {
      this.sendToSocket("updateUser", { id, field, value });
      this.updateUser({ id, field, value });
    }
  }

  updateUser({ id, field, value }) {
    try {
      if (this.cachedUsers.get(id)) {
        this.cachedUsers.update(id, field, value);
        const rooms = this.cachedRooms.values();
        for (const room of rooms) {
          room.chat.updateUser({ id, field, value });
          if (room.id === this.cachedUsers.get(sessionStorage.getItem("id")).currentRoom) this.messagesCacheUpdated(room.chat.get());
        }
        this.usersCacheUpdated(this.cachedUsers.get(id));
      }
      else this.needUserCacheUpdate({ id, call: { function: "updateUser", args: { id, field, value } } });
    } catch (error) {
      error(id, field, value);
      error(error);
    }
  }

  getRoom(id) {
    if (typeof id !== "string") id = id.toString();
    return this.cachedRooms.get(id);
  }

  getUser(id) {
    if (id) {
      return this.cachedUsers.get(id);
    } else {
      return this.cachedUsers.get(sessionStorage.getItem("id"));
    }
  }

  getUsersInRoom(roomId) {
    return this.cachedUsers.getInRoom(roomId);
  }

  getScreenSharingUsersInRoom(roomId) {
    return this.cachedUsers.getScreenSharingUsersInRoom(roomId);
  }

  isAudioFullyConnected() {
    return this.mh.isFullyConnected();
  }

  // chat messages function
  sendChatMessage(data) {
    log(data);
    if (typeof data.roomId !== "string") data.roomId = data.roomId.toString();
    if (typeof data.userId !== "string") data.userId = data.userId.toString();
    const room = this.cachedRooms.get(data.roomId);
    if (room) {
      data.roomId = data.roomId + "@" + data.serverId;
      if (this.wsConnection) {
        this.sendToSocket("sendChatMessage", { ...data, id: data.userId });
      } else {
        error("Socket not found");
      }
    }
    else error("Room not found in cache");
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
          error("User not found in cache");
          this.needUserCacheUpdate({ id: userId, call: { function: "setMessagesCache", args: { messages, roomId } } });
          this.messagesCacheUpdated([]);
          return;
        }
      } else {
        error("Room not found in cache");
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

  checkRoomClicked(data) {
    if (this.wsConnection.socket) {
      this.emit("roomClicked", data);
    } else {
      // reconnect to socket
      error("Socket not found, reconnecting...");
      this.wsConnection.connect(storage.get('token'));
      // retry the action (BAD, but ok for now)
      this.checkRoomClicked(data);
    }
  }
}

export default EchoAPI;