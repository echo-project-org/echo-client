export function createAudioConstraints(echoCancellation = false, noiseSuppression = false, autoGainControl = false, deviceId = 'default') {
    return {
        audio: {
            channelCount: 2,
            sampleRate: 48000,
            sampleSize: 16,
            echoCancellation: echoCancellation,
            noiseSuppression: noiseSuppression,
            autoGainControl: autoGainControl,
            deviceId: deviceId,
            googNoiseSupression: noiseSuppression,
            googAutoGainControl: autoGainControl,
        },
        video: false,
    }
}

export function createVideoConstraints(deviceId = 'default', resolution = { w: 1920, h: 1080 }, fps = 60, cursor = true) {
    return {
        audio: {
            sampleRate: 48000,
            sampleSize: 16,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            chromeMediaSource: 'desktop',
            deviceId: deviceId,
        },
        video: {
            logicalSurface: true,
            displaySurface: 'window',
            width: { ideal: resolution.w, max: resolution.w },
            height: { ideal: resolution.h, max: resolution.h },
            frameRate: { ideal: fps, max: fps },
            cursor: cursor ? 'always' : 'never',
        },
        systemAudio: "include"
    }
}