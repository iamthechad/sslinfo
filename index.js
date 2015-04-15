var opensslinfo = require('./lib/opensslinfo'),
    sslinfo = require('./lib/sslinfo');

module.exports = {
    /**
     * Get information about the OpenSSL version installed where this module is run.
     * Returns a promise.
     * @returns {promise}
     */
    getOpenSSLCapabilities: function () {
        return opensslinfo.getOpenSSLCapabilities();
    },
    /**
     * Determine the supported SSL/TLS protocols and ciphers for a server.
     * Returns a promise.
     * @param hostData {{ host: string, port: number }}
     * @returns {promise}
     */
    getServerResults: function(hostData) {
        return sslinfo.getServerResults(hostData);
    }
};
