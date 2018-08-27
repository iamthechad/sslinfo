var opensslinfo = require('./lib/opensslinfo'),
  certinfo = require('./lib/certificate'),
  sslinfo = require('./lib/sslinfo');

module.exports = {
  /**
   * Get information about the OpenSSL version installed where this module is run.
   * Returns a promise.
   * @returns {Promise<{ ciphers: { supported: string[], unsupported: string[] }, protocols: { supported: string[], unsupported: string[] }, version: string }>}
   */
  getOpenSSLCapabilities: function() {
    return opensslinfo.getOpenSSLCapabilities();
  },
  /**
   * Determine the supported SSL/TLS protocols and ciphers for a server.
   * Returns a promise.
   * @param hostData {{ host: string, port: number, servername?: string, rejectUnauthorized?: boolean, minDHSize?: number }}
   * @returns {Promise<{ cert: { altNames: string[], extensions: Object, fingerPrint: string, issuer: Object, notAfter: Date, notBefore: Date, publicKey: Object, serial: string, signatureAlgorithm; string, version: number }, certPem: string, ciphers: { TLSv1_1_method?: { disabled: string[], enabled: string[], name: string, unsupported: string[] }, TLSv1_2_method?: { disabled: string[], enabled: string[], name: string, unsupported: string[] }, TLSv1_method?: { disabled: string[], enabled: string[], name: string, unsupported: string[] }, SSLv3_method?: { disabled: string[], enabled: string[], name: string, unsupported: string[] }, SSLv2_method?: { disabled: string[], enabled: string[], name: string, unsupported: string[] }}, host: string, port: number, protocols: Object[] }>}
   */
  getServerResults: function(hostData) {
    return sslinfo.getServerResults(hostData);
  },
  /**
   * Get the certificate information for a server.
   * Returns a promise.
   * @param hostData {{ host: string, port: number, servername?: string, rejectUnauthorized?: boolean, minDHSize?: number }}
   * @returns {Promise<{ cert: { altNames: string[], extensions: Object, fingerPrint: string, issuer: Object, notAfter: Date, notBefore: Date, publicKey: Object, serial: string, signatureAlgorithm; string, version: number }, certPem: string, host: string, port: number }>}
   */
  getCertificateInfo: function(hostData) {
    return certinfo.getCertResults(hostData);
  }
};
