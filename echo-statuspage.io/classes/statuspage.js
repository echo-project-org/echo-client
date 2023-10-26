const axios = require('axios');

class StatusPage {
    constructor(config) {
        this.config = config.statusPage
    }

    createIncident() {
        console.log("should create incident")

    }
}

module.exports = StatusPage;