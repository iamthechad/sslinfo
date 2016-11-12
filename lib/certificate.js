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
            .then(convertCertificates);
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
        hostData.authorized = socket.authorized;
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
 * @param peerCert
 * @returns {promise}
 * @private
 */
function convertCertificate(peerCert) {
    var deferred = Q.defer();
    openssl.exec('x509', peerCert.raw, {inform: 'DER'}, function (err, buffer) {
        if (err) {
            return deferred.reject(err);
        }
        var certPEM = buffer.toString();
        deferred.resolve(x509.parseCert(certPEM));
    });
    return deferred.promise;
}

/**
 * Iterate over chain of certificates and convert certificate
 * @param hostData {{ host: string, port: number, peerCert: object }}
 * @returns {promise}
 * @private
 */
function convertCertificates(hostData) {
    var deferred = Q.defer();
    if (hostData.peerCert) {
        var peerCert = hostData.peerCert;
        var p = [];
        while (peerCert) {
            p.push(convertCertificate(peerCert));
            if (!hostData.certificateChain || peerCert.issuerCertificate == peerCert) {
                break;
            }
            peerCert = peerCert.issuerCertificate;
        }

        Q.allSettled(p).then(function(results) {
            delete hostData.peerCert;
            var certs = [];
            results.forEach(function (result) {
                if (result.state === "fulfilled") {
                    certs.push(result.value);
                } else {
                    if (hostData.certificateChain) {
                        certs.push(Error(result.reason));
                    } else {
                        deferred.reject(result.reason);
                    }
                }
            });
            hostData.cert = certs[0];
            if (hostData.certificateChain) {
                hostData.certs = certs;
            }
            deferred.resolve(hostData);
        });
    } else {
        deferred.resolve(hostData);
    }
    return deferred.promise;
}
