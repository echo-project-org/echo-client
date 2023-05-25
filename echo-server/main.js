const Loader = require("./classes/configLoader");
const config = new Loader();

const { Server } = require('socket.io')
const io = new Server(config.port, {
    cors: {
        origin: '*',
    }
});

const users = new Map();

const Colors = require("./classes/colors");
const colors = new Colors();

const User = require("./classes/users");

console.log(colors.changeColor("red", "Listening for shit :)"))
io.on('connection', (IOSocket) => {
    console.log(colors.changeColor("green", "New socket connection"));
    
    const user = new User(IOSocket);
    users.set(user.socketId, user);
});