const path = require('path');

module.exports = {
    webpack: {
        alias: {
            '@root': path.resolve(__dirname, './src/'),
            '@views': path.resolve(__dirname, './src/views'),
            '@lib': path.resolve(__dirname, './src/lib'),
            '@img': path.resolve(__dirname, './src/img'),
            '@components': path.resolve(__dirname, './src/components'),
            '@css': path.resolve(__dirname, './src/css'),
            '@audio': path.resolve(__dirname, './src/audio'),
            '@cache': path.resolve(__dirname, './src/cache'),
        },
    },
}
