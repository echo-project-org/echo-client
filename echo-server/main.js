const Loader = require("./classes/configLoader");
const config = new Loader();

const { Server } = require('socket.io')
const io = new Server(config.port, {
    cors: {
        origin: '*',
    }
});

io.use((socket, next) => {
    // middleware to do whatever we want
    // const request = socket.request;
    // console.log("request param: ", request._query);
    next();
});


const Rooms = require("./classes/rooms");
new Rooms(io);