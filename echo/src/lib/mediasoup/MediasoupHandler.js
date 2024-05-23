import { ee } from "@root/index";
import MicrophoneCapturer from "@lib/mediasoup/MicrophoneCapturer";

const api = require('@lib/api');
const mediasoup = require('mediasoup-client');
const { warn, error, log, info } = require('@lib/logger');

class MediasoupHandler {
    constructor(inputDeviceId = 'default', outputDeviceId = 'default',) {
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
    async createTransport(type, routerCapabilities, tranportData) {
        return new Promise(async (resolve, reject) => {
            if (!this.mediasoupDevice) {
                reject('mediasoupDevice not initialized');
            }

            if (!type) {
                reject('Type is required');
            }

            if (!routerCapabilities) {
                reject('Router capabilities are required');
            }

            if (!tranportData) {
                reject('Transport data is required');
            }

            if (!this.mediasoupDevice.loaded) {
                // Load the device with the given rtpCapabilities
                await this.mediasoupDevice.load({ routerRtpCapabilities: routerCapabilities });
            }

            let transport;
            if (type === 'audioOut' || type === 'videoOut') {
                transport = await this.mediasoupDevice.createSendTransport(tranportData);
                transport.on("produce", async ({ kind, rtpParameters, appData }, callback, errback) => {
                    info("[MediasoupHandler] Produce event", kind, rtpParameters, appData);
                    api.call(
                        type === 'audioOut' ? "media/audio/produce" : "media/video/produce",
                        "POST",
                        {
                            data: {
                                id: sessionStorage.getItem('id') + "-" + kind,
                                kind: kind,
                                rtpParameters: rtpParameters,
                                appData: appData
                            }
                        }
                    ).then((res) => {
                        info("[MediasoupHandler] Produce event success", res);
                        callback({ id: res.producerId });
                    }).catch((err) => {
                        error("[MediasoupHandler] Produce event error", err);
                        ee.mediasoupConnectionFailed();
                        errback("[MediasoupHandler] Produce event error");
                    });
                });
            } else if (type === 'audioIn' || type === 'videoIn') {
                transport = await this.mediasoupDevice.createRecvTransport(tranportData);
            } else {
                reject('Invalid transport type');
            }

            if (type === 'audioOut') {
                // use audio out transport to check connection state
                transport.on('connectionstatechange', (state) => {
                    ee.rtcConnectionStateChange({
                        state: state,
                    })
                });
            }

            transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                info("[MediasoupHandler] Connecting transport")
                api.call(
                    "media/transport/connect",
                    "POST",
                    {
                        id: sessionStorage.getItem('id'),
                        type: type,
                        data: dtlsParameters
                    }
                ).then((res) => {
                    info("[MediasoupHandler] Transport connected", res);
                    callback();
                }).catch((err) => {
                    error("[MediasoupHandler] Error connecting transport", err);
                    ee.mediasoupConnectionFailed();
                    errback();
                });
            });

            this.transports.set(type, transport);
            resolve(transport);
        });
    }

    getConnectionStats() {
        return new Promise(async (resolve, reject) => {
            let audioTransport = this.transports.get('audioOut');
            if (!audioTransport) {
                reject('Audio producer not initialized');
            }

            let stats = audioTransport.getStats();
            stats.then((res) => {
                let ping = 0;
                let bytesSent = 0;
                let bytesReceived = 0;
                let packetsSent = 0;
                let packetsReceived = 0;
                let jitterIn = 0;
                let packetLostIn = 0;

                res.forEach((report) => {
                    if (report.type === "candidate-pair" && report.nominated) {
                        ping = report.currentRoundTripTime * 1000;
                        bytesSent = report.bytesSent;
                        bytesReceived = report.bytesReceived;
                        packetsSent = report.packetsSent;
                        packetsReceived = report.packetsReceived;
                    }

                    if (report.type === "remote-inbound.rtp" && report.kind === "audio") {
                        jitterIn = report.jitter * 1000;
                        packetLostIn = report.packetsLost;
                    }
                })

                resolve({
                    ping: ping,
                    bytesSent: bytesSent,
                    bytesReceived: bytesReceived,
                    packetsSent: packetsSent,
                    packetsReceived: packetsReceived,
                    jitterIn: jitterIn,
                    packetLostIn: packetLostIn
                });
            }).catch((err) => {
                reject(err);
            });
        });
    }

    closeConnection() {
        this.transports.forEach((transport) => {
            transport.close();
        });

        this.transports.clear();
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
                    log('Microphone started', track);
                    const audioTransport = this.transports.get('audioOut');
                    const audioProducer = audioTransport.produce({
                        track: track,
                        codecOptions: {
                            opusStereo: true,
                            opusDtx: true
                        }
                    }).then((producer) => {
                        log('Audio producer created', audioProducer);
                        this.audioProducer = audioProducer;
                        resolve(audioProducer);
                    }).catch((e) => {
                        reject(e);
                    });
                });
            } catch (e) {
                error('Error starting audio broadcast', e);
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

    setMicrophoneVolume(volume) {
        this.mic.setVolume(volume);
    }

    setMicrophoneDevice(deviceId) {
        return new Promise(async (resolve, reject) => {
            try {
                //instantiate new microphone capturer with new device id
                let newMic = new MicrophoneCapturer(deviceId);

                if (this.audioProducer) {
                    //replace the outgoin stream with the new one
                    this.audioProducer.replaceTrack(newMic.stream.getAudioTracks()[0]);
                }

                this.mic = newMic;

                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    toggleMute(mute) {
        if (mute) {
            this.mic.mute();
        } else {
            this.mic.unmute();
        }

        //TODO send audio state to server
    }

    setVadTreshold(treshold) {
        this.mic.setTalkingThreshold(treshold);
    }

    setEchoCancellation(enabled) {
        this.mic.setEchoCancellation(enabled);
    }

    setNoiseSuppression(enabled) {
        this.mic.setNoiseSuppression(enabled);
    }

    setAutoGainControl(enabled) {
        this.mic.setAutoGainControl(enabled);
    }


    setSpeakerVolume(volume) {

    }

    setSpeakerDevice(deviceId) {

    }

    toggleDeaf(deaf) {
        if (deaf) {

        } else {

        }

        //TODO send audio state to server
    }
}

export default MediasoupHandler;