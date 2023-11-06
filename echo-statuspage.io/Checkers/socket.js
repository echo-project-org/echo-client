
const socketIO = require("socket.io-client");

class SocketCheck {
    constructor(service) {
        this.service = service;
        this.socket = socketIO(this.service.url, {
            path: "/socket.io",
            query: { id: "status" }
        });
        
        if (service.fireOnStart) this.check();
        this.interval = setInterval(this.check.bind(this), this.service.interval * 1000);
    }

    check() {
        this.socket.on("connect", () => {
            this.service.status = "ok";
            // socket.disconnect();
        });
        this.socket.on("connect_error", (error) => {
            this.service.status = "error";
            this.service.error = error;
            this.socket.disconnect();
        });
    }
}

module.exports = SocketCheck;