const api = require('@lib/api');
const { ipcRenderer } = require('electron');
const mediasoup = require('mediasoup-client');
const { warn, error, log } = require('@lib/logger');

class MediasoupHandler {
    constructor(id, inputDeviceId = 'default', outputDeviceId = 'default', micVolume = 1.0, speakerVolume = 1.0, noiseSuppression = false, echoCancellation = false, autoGainControl = false) {
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

    /**
 * Creates a new receive transport for mediasoup based on the given data.
 * @async
 * @param {string} type - The type of transport to create.
 * @param {Object} data - The data required to create the receive transport.
 * @param {string} data.id - The ID of the receive transport.
 * @param {RTCIceParameters} data.iceParameters - The ICE parameters for the transport.
 * @param {RTCIceCandidate[]} data.iceCandidates - The ICE candidates for the transport.
 * @param {RTCDtlsParameters} data.dtlsParameters - The DTLS parameters for the transport.
 * @param {RTCSctpParameters} data.sctpParameters - The SCTP parameters for the transport.
 * @param {RTCIceServer[]} data.iceServers - The ICE servers for the transport.
 * @param {string} data.iceTransportPolicy - The ICE transport policy for the transport.
 * @param {Object} data.additionalSettings - Additional settings for the transport.
 */
    async createTransport(type, data) {
        return new Promise(async (resolve, reject) => {
            if (!this.mediasoupDevice) {
                reject('mediasoupDevice not initialized');
                return;
            }

            if (!type) {
                reject('type is required');
                return;
            }

            if (!data) {
                reject('data is required');
                return;
            }

            if (!this.mediasoupDevice.loaded) {
                // Load the device with the given rtpCapabilities
                await this.mediasoupDevice.load({ routerRtpCapabilities: data.rtpCapabilities });
            }

            let transport;
            if (type === 'audioOut' || type === 'videoOut') {
                transport = await this.mediasoupDevice.createSendTransport(data);
                transport.on("produce", async ({ kind, rtpParameters, appData }, callback, errback) => {
                    // TODO Send the producer data to the server
                });
            } else if (type === 'audioIn' || type === 'videoIn') {
                transport = await this.mediasoupDevice.createRecvTransport(data);
            } else {
                reject('Invalid transport type');
            }

            if (type === 'audioOut') {
                // use audio out transport to check connection state
                transport.on('connectionstatechange', (state) => {
                    // TODO Handle the connection state change
                });
            }

            transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                // TODO Send the DTLS parameters to the server
            });

            this.transports.set(type, transport);
            resolve(transport);
        });
    }


    /**
     * @function getAudioDevices - Gets the audio devices
     * @returns {Promise} - The promise that resolves when the audio devices are found
     */
    static async getInputAudioDevices() {
        //Gets the audio devices
        return new Promise((resolve, reject) => {
            var out = [];
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                devices.forEach((device, id) => {
                    if (device.kind === "audioinput" && device.deviceId !== "communications" && device.deviceId !== "default") {
                        out.push({
                            "name": device.label,
                            "id": device.deviceId
                        })
                    }
                })

                resolve(out);
            })
        })
    }


    /**
     * Retrieves the available video sources and filters out those with invalid thumbnail sizes.
     * @returns {Promise<Array<Object>>} An array of video sources with valid thumbnail sizes.
     */
    static async getVideoSources() {
        try {
            const srcs = await ipcRenderer.invoke("getVideoSources");
            return srcs.filter((src) => {
                return (src.thumbnail.getSize().width > 0 && src.thumbnail.getSize().height > 0);
            });
        } catch (err) {
            return [];
        }
    }
}

export default MediasoupHandler;