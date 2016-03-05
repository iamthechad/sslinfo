var Q = require('q'),
    _ = require('lodash'),
    openssl = require('openssl-wrapper'),
    cipher = require('./cipher'),
    util = require('./method');

module.exports = {
    /**
     * Get information about the OpenSSL version installed where this module is run.
     * Returns a promise.
     * @returns {promise}
     */
    getOpenSSLCapabilities: function () {
        return getOpenSSLVersion()
            .then(getOpenSSLProtocols)
            .then(getOpenSSLCiphers);
    }
};

/**
 * Determine the installed OpenSSL version
 * @returns {promise}
 * @private
 */
function getOpenSSLVersion() {
    var deferred = Q.defer();
    openssl.exec('version', function (err, buffer) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve({version: buffer.toString().trim()});
        }
    });
    return deferred.promise;
}

/**
 * Determine the SSL/TLS protocols supported by the installed OpenSSL version
 * @param opensslData {object}
 * @returns {promise}
 * @private
 */
function getOpenSSLProtocols(opensslData) {
    var tasks = _.values(util.methods()).map(function (d) {
        return util.trySSLMethod({host: 'www.google.com', port: 443, protocol: d});
    });
    return Q.all(tasks).then(function (results) {
        opensslData.protocols = {
            supported: [],
            unsupported: []
        };
        results.forEach(function (item) {
            if (item.enabled) {
                opensslData.protocols.supported.push(item.name);
            } else {
                opensslData.protocols.unsupported.push(item.name);
            }
        });
        return opensslData;
    });
}

/**
 * Determine the ciphers supported by the installed OpenSSL version.
 * @param opensslData {object}
 * @returns {promise}
 * @private
 */
function getOpenSSLCiphers(opensslData) {
    var deferred = Q.defer();
    openssl.exec('ciphers', function (err, buffer) {
        if (err) {
            deferred.reject(err);
        } else {
            opensslData.ciphers = {
                supported: [],
                unsupported: []
            };
            var ciphers = buffer.toString().trim().split(':');
            opensslData.ciphers.supported = ciphers;
            opensslData.ciphers.unsupported = _.difference(cipher.cipherSuites(), ciphers);
            deferred.resolve(opensslData);
        }
    });
    return deferred.promise;
}
