var Q = require('q'),
    _ = require('lodash'),
    tls = require('tls'),
    x509 = require('x509'),
    openssl = require('openssl-wrapper');

module.exports = {
    /**
     * Get the public certificate of a secure host.
     * @param hostData {{ host: string, port: number }}
     * @returns {promise}
     */
    getCertResults: function (hostData) {
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
 * @param hostData {{ host: string, port: number, peerCert: object }}
 * @returns {promise}
 * @private
 */
function convertCertificate(hostData) {
    var deferred = Q.defer();
    if (hostData.peerCert) {
        openssl.exec('x509', hostData.peerCert.raw, {inform: 'DER'}, function (err, buffer) {
            if (err) {
                deferred.reject(err);
            } else {
                var certPEM = buffer.toString();
                var cert = x509.parseCert(certPEM);
                delete hostData.peerCert;
                hostData.cert = cert;
                deferred.resolve(hostData);
            }
        });
    } else {
        deferred.resolve(null);
    }
    return deferred.promise;
}
