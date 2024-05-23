import Emitter from "wildemitter";
const { log } = require('@lib/logger');

class EchoEvents {

}

Emitter.mixin(EchoEvents);

EchoEvents.prototype.tokenExpired = function () {
    this.emit("tokenExpired");
}

EchoEvents.prototype.roomClicked = function (data) {
    this.emit("roomClicked", data);
}

EchoEvents.prototype.usersCacheUpdated = function (data) {
    this.emit("usersCacheUpdated", data);
}

EchoEvents.prototype.rtcConnectionStateChange = function (data) {
    if (data.state === 'failed') {
        alert("Mediasoup connection failed. Websocket is working but your firewall might be blocking it.")
    }

    this.currentConnectionState = data.state;
    this.emit("rtcConnectionStateChange", data);
}

EchoEvents.prototype.updatedAudioState = function (data) {
    this.emit("updatedAudioState", data);
}

EchoEvents.prototype.userJoinedChannel = function (data) {
    this.emit("userJoinedChannel", data);
}

EchoEvents.prototype.userLeftChannel = function (data) {
    this.emit("userLeftChannel", data);
}

EchoEvents.prototype.receiveChatMessage = function (data) {
    this.emit("receiveChatMessage", data);
}

EchoEvents.prototype.messagesCacheUpdated = function (data) {
    this.emit("messagesCacheUpdated", data);
}

EchoEvents.prototype.needUserCacheUpdate = function (data) {
    this.emit("needUserCacheUpdate", data);
}

EchoEvents.prototype.audioStatsUpdate = function (data) {
    this.emit("audioStatsUpdate", data);
}

EchoEvents.prototype.videoBroadcastStarted = function (data) {
    this.emit("videoBroadcastStarted", data);
}

EchoEvents.prototype.videoBroadcastHasAudio = function (data) {
    this.emit("videoBroadcastHasAudio", data);
}

EchoEvents.prototype.videoBroadcastStop = function (data) {
    this.emit("videoBroadcastStop", data);
}

EchoEvents.prototype.exitedFromRoom = function (data) {
    this.emit("exitedFromRoom", data);
}

EchoEvents.prototype.joinedRoom = function (data) {
    this.emit("joinedRoom", data);
}

EchoEvents.prototype.mediasoupConnectionFailed = function (data) {
    this.emit("mediasoupConnectionFailed", data);
}

EchoEvents.prototype.gotVideoStream = function (data) {
    this.emit("gotVideoStream", data);
}

EchoEvents.prototype.screenShareStopped = function (data) {
    this.emit("screenShareStopped", data);
}

EchoEvents.prototype.localUserCrashed = function (data) {
    this.emit("localUserCrashed", data);
}

EchoEvents.prototype.friendCacheUpdated = function (data) {
    this.emit("friendCacheUpdated", data);
}

EchoEvents.prototype.logout = function () {
    this.emit("logout");
}

EchoEvents.prototype.canSafelyCloseApp = function () {
    this.emit("canSafelyCloseApp");
}

EchoEvents.prototype.appClosing = function () {
    this.emit("appClosing");
}

EchoEvents.prototype.requestAppClose = function () {
    this.emit("requestAppClose");
}

export default EchoEvents;