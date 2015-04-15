var opensslinfo = require('./lib/opensslinfo'),
    sslinfo = require('./lib/sslinfo');

module.exports = {
    getOpenSSLCapabilities: function () {
        return opensslinfo.getOpenSSLCapabilities();
    },
    getServerResults: function(hostData) {
        return sslinfo.getServerResults(hostData);
    }
};
