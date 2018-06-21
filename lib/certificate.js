var Q = require('q'),
  _ = require('lodash'),
  tls = require('tls'),
  x509 = require('x509');

module.exports = {
  /**
   * Get the public certificate of a secure host.
   * @param hostData {{ host: string, port: number }}
   * @returns {promise}
   */
  getCertResults: function(hostData) {
    return getRawCertificate(hostData)
      .then(convertCertificate);
  }
};

/**
 * Get the basic host certificate information, which contains the raw cert in DER format.
 * @param hostData {{ host: string, port: number }}
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
    hostData.peerCert = socket.getPeerCertificate(true);
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
 * @param hostData {{ host: string, port: number, peerCert: object }}
 * @returns {promise}
 * @private
 */
function convertCertificate(hostData) {
  var deferred = Q.defer();
  if (hostData.peerCert) {
    hostData.certPEM = '-----BEGIN CERTIFICATE-----\n' + hostData.peerCert.raw.toString('base64') + '\n-----END CERTIFICATE-----';
    hostData.cert = x509.parseCert(hostData.certPEM);
    if (hostData.peerCert.issuerCertificate) {
      hostData.certCaPem = '-----BEGIN CERTIFICATE-----\n' + hostData.peerCert.issuerCertificate.raw.toString('base64') + '\n-----END CERTIFICATE-----'
      hostData.certCa = x509.parseCert(hostData.certCaPem);
    }
    delete hostData.peerCert;
    deferred.resolve(hostData);
  } else {
    deferred.resolve(null);
  }
  return deferred.promise;
}
