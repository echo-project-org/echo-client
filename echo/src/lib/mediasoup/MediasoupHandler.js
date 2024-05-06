const api = require('@lib/api');
const { ipcRenderer } = require('electron');
const mediasoup = require('mediasoup-client');
const { warn, error, log } = require('@lib/logger');

class MediasoupHandler {
    constructor(id, inputDeviceId = 'default', outputDeviceId = 'default', micVolume = 1.0, speakerVolume = 1.0, noiseSuppression = false, echoCancellation = false, autoGainControl = false){
        this.id = id;

        this.inputDeviceId = inputDeviceId;
        this.outputDeviceId = outputDeviceId;

        this.micVolume = micVolume;
        this.speakerVolume = speakerVolume;

        this.noiseSuppression = noiseSuppression;
        this.echoCancellation = echoCancellation;
        this.autoGainControl = autoGainControl;
        this.outChannelCount = 2;

        this.mediasoupDevice = null;
        this.transports = new Map();
    }
}

export default MediasoupHandler;