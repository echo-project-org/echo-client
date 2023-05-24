const Loader = require("./classes/configLoader");
const config = new Loader();

const { Server } = require('socket.io')
const io = new Server(config.port, {
    cors: {
        origin: '*',
    }
});

var socket;

const users = new Map();

const Colors = require("./classes/colors");
const colors = new Colors();

const User = require("./classes/user");

console.log(colors.changeColor("red", "Listening for shit :)"))
io.on('connection', (IOSocket) => {
    console.log(colors.changeColor("green", "Socket connected"));
    socket = IOSocket;
    io.emit('open');
    
    socket.on("join", (data) => {
        users.set(data.id, new User(data.id, socket, io));
    });
});