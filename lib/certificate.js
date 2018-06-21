var Q = require('q'),
  _ = require('lodash'),
  tls = require('tls'),
  x509 = require('x509');

module.exports = {
  /**
   * Get the public certificate of a secure host.
   * @param hostData {{ host: string, port: number, servername?: string, rejectUnauthorized?: boolean, minDHSize?: number }}
   * @returns {promise}
   */
  getCertResults: function(hostData) {
    return getRawCertificate(hostData)
      .then(convertCertificate);
  }
};

/**
 * Get the basic host certificate information, which contains the raw cert in DER format.
 * @param hostData {{ host: string, port: number, servername?: string, rejectUnauthorized?: boolean, minDHSize?: number }}
 * @returns {promise}
 * @private
 */
function getRawCertificate(hostData) {
  var fullOptions = {
    rejectUnauthorized: false
  };
  fullOptions = _.extend(fullOptions, hostData);

  var deferred = Q.defer();
  var socket = tls.connect(fullOptions, function() {
    hostData.peerCert = socket.getPeerCertificate();
    deferred.resolve(hostData);
    socket.end();
  });
  socket.setEncoding('utf8');
  socket.on('error', function(error) {
    deferred.reject(error);
    socket.end();
  });
  return deferred.promise;
}

/**
 * Convert a certificate from DER to PEM format
 * @param hostData {{ host: string, port: number, peerCert: object, servername?: string, rejectUnauthorized?: boolean, minDHSize?: number }}
 * @returns {Promise<null | { host: string, port: number, peerCert: object, servername?: string, rejectUnauthorized?: boolean, minDHSize?: number, cert?: any, certPEM?: string}>}
 * @private
 */
function convertCertificate(hostData) {
  var deferred = Q.defer();
  if (hostData.peerCert) {
    var certPEM = '-----BEGIN CERTIFICATE-----\n' + hostData.peerCert.raw.toString('base64') + '\n-----END CERTIFICATE-----';
    var cert = x509.parseCert(certPEM);
    delete hostData.peerCert;
    hostData.cert = cert;
    hostData.certPEM = certPEM;
    deferred.resolve(hostData);
  } else {
    deferred.resolve(null);
  }
  return deferred.promise;
}
