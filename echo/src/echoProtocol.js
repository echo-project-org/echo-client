var socket;
const at = require('./audioTransmitter')


function parseMessage(msg){
    if(msg.includes("ECHO")){
        alert(msg)
    }
}

export async function openConnection(id) {
    socket = new WebSocket("ws://localhost:6982");

    socket.onopen = function (e) {
        socket.send("ECHO JOIN " + id);
    };

    socket.onmessage = function (event) {
        parseMessage(event.data)
    };

    socket.onclose = function (event) {
        if (event.wasClean) {
            //If closing was clean
        } else {
            alert('Connection with the server died');
        }
        
        at.stopAudioStream();
    };

    socket.onerror = function (error) {
        alert("The audio server connection has errored out")
        at.stopAudioStream();
    };
}

export async function closeConnection(id) {
    if(socket){
        socket.send("ECHO QUIT " + id);
        socket.close();
    }
}

export async function sendMessage(msg) {
    if(socket){
        socket.send("ECHO MSG" + msg);
    }
}

export async function sendAudioPacket(left, right) {
    if(socket){
        socket.send("ECHO AUD" + JSON.stringify(left) + JSON.stringify(right));
    }
}

