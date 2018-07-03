module.exports = {
    hookTimeout: 30000000,
    ssl: {
        key: require('fs').readFileSync(__dirname + '/ssl/privatekey.pem'),
        cert: require('fs').readFileSync(__dirname + '/ssl/cert.pem')
    },
};