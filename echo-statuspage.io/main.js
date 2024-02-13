const config = require("./config.json");
const HttpCheck = require("./Checkers/http");
const SocketCheck = require("./Checkers/socket");
const StatusPage = require("./classes/statuspage");

const Logger = require("./classes/logger");
new Logger(config);

const Database = require("./classes/database");
const db = new Database(config);

const checkers = [];

config.services.forEach(element => {
    element.runner = new StatusPage(config, db);
    element.db = db;
    switch (element.type) {
        case "http":
            checkers.push(new HttpCheck(element));
            break;
        case "socket":
            checkers.push(new SocketCheck(element));
            break;
        default:
            console.error("Unknown service type: " + element.type);
            break;
    }
});

// console.warn(checkers);


