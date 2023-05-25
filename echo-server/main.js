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
io.use((socket, next) => {
    const request = socket.request;
    console.log("request param: ", request._query);
    next();
})

io.on('connection', (socket) => {
    const request = socket.request;
    const id = request._query["id"];
    
    console.log(colors.changeColor("green", "New socket connection"));
    
    const newUser = new User(socket, id);
    users.set(id, newUser);

    console.log(users);

    users.forEach((uReceiver, receiver) => {
        users.forEach((uTrasmitter, trasmitter) => {
            // console.log("trying adding new remote user on connection", id, user.id)
            if (receiver !== trasmitter) {
                console.log("adding new remote user on connection", receiver, uReceiver.id)
                uReceiver.addRemoteUser(uReceiver);
            }
        })
    })
});