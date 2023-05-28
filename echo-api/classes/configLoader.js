class Loader {
    constructor() {
        var cfg;
        try {
            cfg = require("../config.json");
        } catch(e) {
            cfg = require("../config_template.json");
        }

        this.port = cfg.port;
        this.ssl = cfg.ssl;
        this.config = cfg;
    }

    getCfg() {
        return this.config;
    }
}

module.exports = Loader;