class Loader {
    constructor() {
        var cfg;
        try {
            cfg = require("../config_template.json");
        } catch(e) {
            cfg = require("../config.json");
        }

        this.port = cfg.port;
        this.ssl = cfg.ssl;
    }
}

module.exports = Loader;