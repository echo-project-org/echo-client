
const socket = require("socket.io-client");

class SocketCheck {
    constructor(service) {
        this.service = service;
        this.interval = setInterval(this.check.bind(this), this.service.interval * 1000);
    }

    check() {
        const socket = socket(this.service.url);
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