var Q = require('q'),
    _ = require('underscore'),
    openssl = require('openssl-wrapper'),
    cipher = require('./cipher'),
    util = require('./method');

module.exports = {
    getOpenSSLCapabilities: function () {
        return getOpenSSLVersion()
            .then(getOpenSSLProtocols)
            .then(getOpenSSLCiphers);
    }
};

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

function getOpenSSLProtocols(opensslData) {
    var tasks = _.keys(util.methods()).map(function (d) {
        return util.trySSLMethod({host: 'www.google.com', port: 443, secureProtocol: d});
    });
    return Q.all(tasks).then(function (results) {
        opensslData.protocols = {
            supported: [],
            unsupported: []
        };
        results.forEach(function (item) {
            if (item.enabled) {
                opensslData.protocols.supported.push(item.protocol);
            } else {
                opensslData.protocols.unsupported.push(item.protocol);
            }
        });
        return opensslData;
    });
}

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
