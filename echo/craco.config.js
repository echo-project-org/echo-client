const path = require('path');

module.exports = {
    webpack: {
        alias: {
            '@root': path.resolve(__dirname, './src/'),
            '@lib': path.resolve(__dirname, './src/lib'),
            '@components': path.resolve(__dirname, './src/components'),
            '@css': path.resolve(__dirname, './src/css'),
            '@audio': path.resolve(__dirname, './src/audio'),
            '@cache': path.resolve(__dirname, './src/cache'),
        },
    },
}
