var method = require('./method'),
  certificate = require('./certificate'),
  cipher = require('./cipher');

module.exports = {
  /**
   * Determine the supported SSL/TLS protocols and ciphers for a server.
   * Returns a promise.
   * @param hostData {{ host: string, port: number }}
   * @returns {promise}
   */
  getServerResults: function (hostData) {
    return certificate.getCertResults(hostData)
      .then(method.getSSLResults)
      .then(cipher.getCipherResults);
  }
};
