import { ep } from "@root/index";

const api = require('@lib/api');
const mediasoup = require('mediasoup-client');
const { warn, error, log } = require('@lib/logger');
const MicrophoneCapturer = require('@lib/mediasoup/MicrophoneCapturer');

class MediasoupHandler {
    constructor(id, inputDeviceId = 'default', outputDeviceId = 'default',) {
        this.id = id;
        this.mic = new MicrophoneCapturer(inputDeviceId);

        this.mediasoupDevice = new mediasoup.Device();
        this.transports = new Map();
        this.audioProducer = null;
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
                    ep.rtcConnectionStateChange({
                        state: state,
                    })
                });
            }

            transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                // TODO Send the DTLS parameters to the server
            });

            this.transports.set(type, transport);
            resolve(transport);
        });
    }

    getRtpCapabilities() {
        if (this.mediasoupDevice) {
            return this.mediasoupDevice.rtpCapabilities;
        }

        return null;
    }

    /**
     * Checks if the send transport is fully connected.
     * @returns {boolean} Whether the send transport is fully connected or not.
    */
    isFullyConnected() {
        const audioTransport = this.transports.get('audioOut');
        if (audioTransport) {
            return (
                audioTransport.connectionState === "connected"
            )
        } else {
            return true;
        }
    }

    startAudioBroadcast() {
        return new Promise(async (resolve, reject) => {
            try {
                this.mic.start(this.inputDeviceId).then(async (track) => {
                    const audioTransport = this.transports.get('audioOut');
                    const audioProducer = await audioTransport.produce({
                        track: track,
                        codecOptions: {
                            opusStereo: true,
                            opusDtx: true
                        }
                    });

                    this.audioProducer = audioProducer;
                    resolve(audioProducer);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    stopAudioBroadcast() {
        return new Promise(async (resolve, reject) => {
            try {
                this.mic.stop();
                if (this.audioProducer) {
                    this.audioProducer.close();
                    this.audioProducer = null;
                }

                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }
}

export default MediasoupHandler;