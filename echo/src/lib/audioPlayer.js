const newMessageSound = require("../audio/newmessage.mp3");
const newSelfMessageSound = require("../audio/newmessageself.mp3");
const muteSound = require("../audio/mute.mp3");
const unmuteSound = require("../audio/unmute.mp3");
const deafSound = require("../audio/deaf.mp3");
const undeafSound = require("../audio/undeaf.mp3");
const leaveSound = require("../audio/leave.mp3");
const joinSound = require("../audio/join.mp3");
const startStreamSound = require("../audio/streamstart.mp3");
const endStreamSound = require("../audio/streamend.mp3");
const ringtoneSound = require("../audio/echoRingtone.flac");

class AudioPlayer {
    constructor(volume = 0.6) {
        this.newMessageSound = new Audio(newMessageSound);
        this.newSelfMessageSound = new Audio(newSelfMessageSound);
        this.muteSound = new Audio(muteSound);
        this.unmuteSound = new Audio(unmuteSound);
        this.deafSound = new Audio(deafSound);
        this.undeafSound = new Audio(undeafSound);
        this.leaveSound = new Audio(leaveSound);
        this.joinSound = new Audio(joinSound);
        this.startStreamSound = new Audio(startStreamSound);
        this.endStreamSound = new Audio(endStreamSound);
        this.ringtoneSound = new Audio(ringtoneSound);
        this.volume = volume;

        this.newMessageSound.volume = volume;
        this.newSelfMessageSound.volume = volume;
        this.muteSound.volume = volume;
        this.unmuteSound.volume = volume;
        this.deafSound.volume = volume;
        this.undeafSound.volume = volume;
        this.leaveSound.volume = volume;
        this.joinSound.volume = volume;
        this.startStreamSound.volume = volume;
        this.endStreamSound.volume = volume;
        this.ringtoneSound.volume = volume;
    }

    setVolume(volume) {
        this.volume = volume;
        this.newMessageSound.volume = volume;
        this.newSelfMessageSound.volume = volume;
        this.muteSound.volume = volume;
        this.unmuteSound.volume = volume;
        this.deafSound.volume = volume;
        this.undeafSound.volume = volume;
        this.leaveSound.volume = volume;
        this.joinSound.volume = volume;
        this.startStreamSound.volume = volume;
        this.endStreamSound.volume = volume;
        this.ringtoneSound.volume = volume;
    }
    
    playNewMessageSound() {
        this.newMessageSound.play();
    }
    
    playNewSelfMessageSound() {
        this.newSelfMessageSound.play();
    }
    
    playMuteSound() {
        this.muteSound.play();
    }
    
    playUnmuteSound() {
        this.unmuteSound.play();
    }
    
    playDeafSound() {
        this.deafSound.play();
    }
    
    playUndeafSound() {
        this.undeafSound.play();
    }
    
    playLeaveSound() {
        this.leaveSound.play();
    }
    
    playJoinSound() {
        this.joinSound.play();
    }
    
    playStartStreamSound() {
        this.startStreamSound.play();
    }
    
    playEndStreamSound() {
        this.endStreamSound.play();
    }

    startPlayingRingtone() {
        this.ringtoneSound.loop = true;
        this.ringtoneSound.play();
    }

    stopPlayingRingtone() {
        this.ringtoneSound.pause();
        this.ringtoneSound.loop = false;
        this.ringtoneSound.currentTime = 0;
    }
}

export default AudioPlayer;