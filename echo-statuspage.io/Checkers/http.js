const axios = require('axios');

class HttpCheck {
    constructor(service) {
        console.log("[CHECKER] Added http checker for " + service.name);
        this.service = service;
        this.interval = setInterval(this.check.bind(this), this.service.interval * 1000);
        this.callTIme = Date.now();
        this.responseTime = 0;
        if (service.fireOnStart) this.check();
    }

    check() {
        this.callTIme = Date.now();
        // console.log("[HTTP] " + this.service.name + " http call started")
        axios.get(this.service.url)
            .then((response) => {
                console.log("[HTTP] " + this.service.name + " http call was successful and took " + (Date.now() - this.callTIme) + "ms");
                this.responseTime = Date.now() - this.callTIme;
                this.service.status = "ok";
                this.service.error = "Everything operational";
                this.checkResponseTime();
            })
            .catch((error) => {
                this.responseTime = Date.now() - this.callTIme;
                this.service.status = "error";
                this.service.error = typeof error == "string" ? JSON.parse(error) : error;
                this.translateError();
            });
    }

    checkResponseTime() {
        if (this.responseTime > this.service.responseTime) {
            this.service.status = "low_performance";
            this.service.error = "Response time too high";
            console.log("[HTTP] " + this.service.name + " is in state " + this.service.status + " (" + this.service.error + ")");
        }
        this.service.runner.updateStatusPage(this.service);
    }

    translateError() {
        // console.log(this.service.error)
        switch (this.service.error.code) {
            case "ERR_BAD_REQUEST":
                this.service.error = "Unresponsive endpoint";
                this.service.runner.updateStatusPage(this.service);
                break;
            case "ERR_BAD_RESPONSE":
                this.service.error = "Unresponsive endpoint";
                this.service.runner.updateStatusPage(this.service);
                break;
            default:
                break;
        }

        console.log("[HTTP] " + this.service.name + " is in state " + this.service.status + " (" + this.service.error + ")");
    }
}

module.exports = HttpCheck;