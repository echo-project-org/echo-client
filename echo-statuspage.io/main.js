const config = require("./config.json");
const HttpCheck = require("./Checkers/http");
const SocketCheck = require("./Checkers/socket");

const checkers = [];


config.services.forEach(element => {
    switch (element.type) {
        case "http":
            checkers.push(new HttpCheck(element));
            break;
        case "socket":
            checkers.push(new SocketCheck(element));
            break;
        default:
            console.error("Unknown service type: " + element.type);
            break
    }
});


