import { ep } from "../index";

const io = require("socket.io-client");

class wsConnection {
  constructor() {
    this.socket = null;
    this.SERVER_URL = "https://echo.kuricki.com";
  }

  connect(token) {
    console.log("Connecting to: ", this.SERVER_URL);

    this.socket = io(this.SERVER_URL, {
      path: "/socket.io",
      query: { token: token },
    });

    // Connection events
    this.socket.on("close", () => {
      ep.wsConnectionClosed();
    });

    this.socket.on("error", (error) => {
      ep.wsConnectionError(error);
    });

    this.socket.on("server.endConnection", (data) => {
      ep.endConnection(data);
    });

    this.socket.on("portalTurret.areYouStillThere?", (data) => {
      if (this.socket) {
        this.send("thereYouAre");
      }
    });

    //Custom events
    this.socket.on("server.userJoinedChannel", (data) => {
      ep.wsUserJoinedChannel(data);
    });

    this.socket.on("server.userLeftChannel", (data) => {
      ep.wsUserLeftChannel(data);
    });

    this.socket.on("server.receiveChatMessage", (data) => {
      ep.wsReceiveChatMessage(data);
    });

    this.socket.on("server.userUpdated", (data) => {
      ep.wsUserUpdated(data);
    });

    this.socket.on("server.friendAction", (data) => {
      console.log("server.friendAction: ", data)
      ep.wsFriendAction(data);
    });

    //Media events
    this.socket.on("server.videoBroadcastStarted", (data) => {
      ep.wsVideoBroadcastStarted(data);
    });

    this.socket.on("server.broadcastNowHasAudio", (data) => {
      ep.wsBroadcastNowHasAudio(data);
    });

    this.socket.on("server.videoBroadcastStop", (data) => {
      ep.wsVideoBroadcastStop(data);
    });

    this.socket.on("server.receiveTransportCreated", (data) => {
      ep.wsReceiveTransportCreated(data);
    });

    this.socket.on("server.sendTransportCreated", (data) => {
      ep.wsSendTransportCreated(data);
    });

    this.socket.on("server.receiveVideoTransportCreated", (data) => {
      ep.wseReceiveVideoTransportCreated(data);
    });

    this.socket.on("server.sendVideoTransportCreated", (data) => {
      ep.wsSendVideoTransportCreated(data);
    });

    this.socket.on("server.sendAudioState", (data) => {
      ep.wsSendAudioState(data);
    });
  }

  send(request, data, cb) {
    if (this.socket) {
      this.socket.emit("client." + request, data, (a) => {
        if (cb) {
          if (a.response === "error") {
            console.error(request, a);
            ep.localUserCrashed();
            return;
          }
          cb(a);
        }
      });
    }
  }

  close() {
    this.socket.close();
  }

}

export default wsConnection;