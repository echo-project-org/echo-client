const request = require('request');

class HttpCheck {
    constructor(service) {
        this.service = service;
        this.interval = setInterval(this.check.bind(this), this.service.interval * 1000);
    }

    check() {
        request(this.service.url, (error, response, body) => {
            if (error) {
                this.service.status = "error";
                this.service.error = error;
            } else {
                this.service.status = response.statusCode;
            }
        });
    }
}

module.exports = HttpCheck;