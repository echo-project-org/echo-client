import Emitter from "wildemitter";
import EchoAPI from "./lib/echoApi";

class EchoProtocol extends EchoAPI {
  constructor() {
    super();
  }
}

Emitter.mixin(EchoProtocol);

EchoProtocol.prototype.tokenExpired = function () {
  this.emit("tokenExpired");
}

EchoProtocol.prototype.roomClicked = function (data) {
  this.emit("roomClicked", data);
}

EchoProtocol.prototype.usersCacheUpdated = function (data) {
  this.emit("usersCacheUpdated", data);
}

EchoProtocol.prototype.rtcConnectionStateChange = function (data) {
  if (data.state === 'failed') {
    alert("Mediasoup connection failed. Websocket is working but your firewall might be blocking it.")
    this.closeConnection();
    this.localUserCrashed({ id: sessionStorage.getItem("id") });
    return;
  }

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
  this.updateUser({ id: data.id, field: "talking", value: data.talking })
  this.emit("audioStatsUpdate", data);
}

EchoProtocol.prototype.videoBroadcastStarted = function (data) {
  this.emit("videoBroadcastStarted", data);
}

EchoProtocol.prototype.videoBroadcastHasAudio = function (data) {
  this.emit("videoBroadcastHasAudio", data);
}

EchoProtocol.prototype.videoBroadcastStop = function (data) {
  this.emit("videoBroadcastStop", data);
}

EchoProtocol.prototype.exitedFromRoom = function (data) {
  this.emit("exitedFromRoom", data);
}

EchoProtocol.prototype.joinedRoom = function (data) {
  this.emit("joinedRoom", data);
}

EchoProtocol.prototype.gotVideoStream = function (data) {
  this.emit("gotVideoStream", data);
}

EchoProtocol.prototype.localUserCrashed = function (data) {
  this.emit("localUserCrashed", data);
}

EchoProtocol.prototype.friendCacheUpdated = function (data) {
  console.log("friendCacheUpdated", data)
  this.emit("friendCacheUpdated", data);
}

export default EchoProtocol;