var socket;
const at = require('./audioTransmitter')
const ar = require('./audioReceiver')


function parseMessage(msg){
    if(msg.includes("ECHO")){
        if(msg.includes("AUD")){
            msg = msg.replace("ECHO AUD ", '');
            var data = JSON.parse(msg)
            console.log("Audio from", data.id);

            var lc = new Float32Array(data.left);
            var rc = new Float32Array(data.right);

            ar.addToBuffer(data.id, lc, rc);
        } else if(msg.includes("JOIN")){
            var id = msg.substring(10)
            ar.startOutputAudioStream(id)
        }
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

export async function sendAudioPacket(id, left, right) {
    if(socket){
        var data = {
            id: id,
            left: Array.from(left),
            right: Array.from(right)
        }

        socket.send("ECHO AUD " + JSON.stringify(data));
    }
}

