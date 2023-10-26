
const socketIO = require("socket.io-client");

class SocketCheck {
    constructor(service) {
        this.service = service;
        if (service.fireOnStart) this.check();
        this.interval = setInterval(this.check.bind(this), this.service.interval * 1000);
    }

    check() {
        const socket = socketIO(this.service.url);
        socket.on("connect", () => {
            this.service.status = "ok";
            socket.disconnect();
        });
        socket.on("connect_error", (error) => {
            this.service.status = "error";
            this.service.error = error;
            socket.disconnect();
        });
    }
}

module.exports = SocketCheck;