var Q = require('q'),
    _ = require('underscore'),
    openssl = require('openssl-wrapper'),
    method = require('./method');

module.exports = {
    /**
     * Determine the ciphers supported by a host for specific SSL/TLS methods.
     * @param hostData {object}
     * @return {promise}
     */
    getCipherResults: function (hostData) {
        var allTasks = [];
        hostData.protocols.forEach(function (item) {
            if (item.enabled) {
                var tasks = cipherSuites.map(function (d) {
                    return trySSLCipher({
                        host: hostData.host,
                        port: hostData.port,
                        protocol: method.methods()[item.protocol],
                        cipher: d
                    });
                });
                allTasks.push(tasks);
            }
        });
        return Q.all(_.flatten(allTasks)).then(function (results) {
            hostData.ciphers = {};
            results.forEach(function (item) {
                if (!hostData.ciphers[item.protocol]) {
                    hostData.ciphers[item.protocol] = {
                        enabled: [],
                        disabled: [],
                        unsupported: []
                    }
                }
                var cipherRoot = hostData.ciphers[item.protocol];
                if (item.enabled) {
                    cipherRoot.enabled.push(item.cipher);
                } else {
                    if (item.unsupported) {
                        cipherRoot.unsupported.push(item.cipher);
                    } else {
                        cipherRoot.disabled.push(item.cipher);
                    }
                }
            });
            return hostData;
        });
    },
    /**
     * Get the list of cipher suites supported by this tool.
     * @returns {string[]}
     */
    cipherSuites: function () {
        return cipherSuites;
    },
    badCipherSuites: function () {
        return badCipherSuites;
    }
};

/**
 * Determine if a host supports a specific cipher/SSL method combination.
 * @param options {object}
 * @returns {promise}
 * @private
 */
function trySSLCipher(options) {
    var deferred = Q.defer();
    var connectProtocol = options.protocol.opensslAbbrev;
    var commandParams = {
        cipher: options.cipher,
        host: options.host,
        port: options.port,
        prexit: true
    };
    commandParams[connectProtocol] = true;
    openssl.exec('s_client', commandParams, function (err, buffer) {
        var result = buffer.toString();
        var failed = false;
        if (err) {
            var errorString = err.toString();
            if (errorString.indexOf("handshake failure") !== -1) {
                failed = true;
                deferred.resolve({protocol: options.protocol.name, cipher: options.cipher, enabled: false});
            } else if (errorString.indexOf("no cipher match") !== -1) {
                failed = true;
                deferred.resolve({
                    protocol: options.protocol.name,
                    cipher: options.cipher,
                    enabled: false,
                    unsupported: true
                });
            } else if (errorString.indexOf("Cipher is (NONE)") !== -1) {
                failed = true;
                deferred.resolve({protocol: options.protocol.name, cipher: options.cipher, enabled: false});
            } else if (errorString.indexOf("unknown option -" + options.protocol.opensslAbbrev) !== -1) {
                failed = true;
                deferred.resolve({
                    protocol: options.protocol.name,
                    cipher: options.cipher,
                    enabled: false,
                    unsupported: true
                });
            }
            /*else {
             console.log(errorString);
             }*/
        }

        if (!failed) {
            var enabled = true;
            if (result.indexOf("handshake failure") !== -1) {
                enabled = false;
            }
            deferred.resolve({protocol: options.protocol.name, cipher: options.cipher, enabled: enabled});
        } else {
            deferred.reject({
                host: options.host,
                port: options.port,
                protocol: options.protocol.name,
                cipher: options.cipher,
                error: err
            });
        }
    });
    return deferred.promise;
}

var cipherSuites = ['ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES256-SHA384',
        'ECDHE-ECDSA-AES256-SHA384',
        'ECDHE-RSA-AES256-SHA',
        'ECDHE-ECDSA-AES256-SHA',
        'SRP-DSS-AES-256-CBC-SHA',
        'SRP-RSA-AES-256-CBC-SHA',
        'SRP-AES-256-CBC-SHA',
        'DH-DSS-AES256-GCM-SHA384',
        'DHE-DSS-AES256-GCM-SHA384',
        'DH-RSA-AES256-GCM-SHA384',
        'DHE-RSA-AES256-GCM-SHA384',
        'DHE-RSA-AES256-SHA256',
        'DHE-DSS-AES256-SHA256',
        'DH-RSA-AES256-SHA256',
        'DH-DSS-AES256-SHA256',
        'DHE-RSA-AES256-SHA',
        'DHE-DSS-AES256-SHA',
        'DH-RSA-AES256-SHA',
        'DH-DSS-AES256-SHA',
        'DHE-RSA-CAMELLIA256-SHA',
        'DHE-DSS-CAMELLIA256-SHA',
        'DH-RSA-CAMELLIA256-SHA',
        'DH-DSS-CAMELLIA256-SHA',
        'ECDH-RSA-AES256-GCM-SHA384',
        'ECDH-ECDSA-AES256-GCM-SHA384',
        'ECDH-RSA-AES256-SHA384',
        'ECDH-ECDSA-AES256-SHA384',
        'ECDH-RSA-AES256-SHA',
        'ECDH-ECDSA-AES256-SHA',
        'AES256-GCM-SHA384',
        'AES256-SHA256',
        'AES256-SHA',
        'CAMELLIA256-SHA',
        'PSK-AES256-CBC-SHA',
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES128-SHA256',
        'ECDHE-ECDSA-AES128-SHA256',
        'ECDHE-RSA-AES128-SHA',
        'ECDHE-ECDSA-AES128-SHA',
        'SRP-DSS-AES-128-CBC-SHA',
        'SRP-RSA-AES-128-CBC-SHA',
        'SRP-AES-128-CBC-SHA',
        'DH-DSS-AES128-GCM-SHA256',
        'DHE-DSS-AES128-GCM-SHA256',
        'DH-RSA-AES128-GCM-SHA256',
        'DHE-RSA-AES128-GCM-SHA256',
        'DHE-RSA-AES128-SHA256',
        'DHE-DSS-AES128-SHA256',
        'DH-RSA-AES128-SHA256',
        'DH-DSS-AES128-SHA256',
        'DHE-RSA-AES128-SHA',
        'DHE-DSS-AES128-SHA',
        'DH-RSA-AES128-SHA',
        'DH-DSS-AES128-SHA',
        'DHE-RSA-SEED-SHA',
        'DHE-DSS-SEED-SHA',
        'DH-RSA-SEED-SHA',
        'DH-DSS-SEED-SHA',
        'DHE-RSA-CAMELLIA128-SHA',
        'DHE-DSS-CAMELLIA128-SHA',
        'DH-RSA-CAMELLIA128-SHA',
        'DH-DSS-CAMELLIA128-SHA',
        'ECDH-RSA-AES128-GCM-SHA256',
        'ECDH-ECDSA-AES128-GCM-SHA256',
        'ECDH-RSA-AES128-SHA256',
        'ECDH-ECDSA-AES128-SHA256',
        'ECDH-RSA-AES128-SHA',
        'ECDH-ECDSA-AES128-SHA',
        'AES128-GCM-SHA256',
        'AES128-SHA256',
        'AES128-SHA',
        'SEED-SHA',
        'CAMELLIA128-SHA',
        'IDEA-CBC-SHA',
        'PSK-AES128-CBC-SHA',
        'ECDHE-RSA-RC4-SHA',
        'ECDHE-ECDSA-RC4-SHA',
        'ECDH-RSA-RC4-SHA',
        'ECDH-ECDSA-RC4-SHA',
        'RC4-SHA',
        'RC4-MD5',
        'PSK-RC4-SHA',
        'ECDHE-RSA-DES-CBC3-SHA',
        'ECDHE-ECDSA-DES-CBC3-SHA',
        'SRP-DSS-3DES-EDE-CBC-SHA',
        'SRP-RSA-3DES-EDE-CBC-SHA',
        'SRP-3DES-EDE-CBC-SHA',
        'EDH-RSA-DES-CBC3-SHA',
        'EDH-DSS-DES-CBC3-SHA',
        'DH-RSA-DES-CBC3-SHA',
        'DH-DSS-DES-CBC3-SHA',
        'ECDH-RSA-DES-CBC3-SHA',
        'ECDH-ECDSA-DES-CBC3-SHA',
        'DES-CBC3-SHA',
        'PSK-3DES-EDE-CBC-SHA',
        'EDH-RSA-DES-CBC-SHA',
        'EDH-DSS-DES-CBC-SHA',
        'DH-RSA-DES-CBC-SHA',
        'DH-DSS-DES-CBC-SHA',
        'DES-CBC-SHA',
        'EXP-EDH-RSA-DES-CBC-SHA',
        'EXP-EDH-DSS-DES-CBC-SHA',
        'EXP-DH-RSA-DES-CBC-SHA',
        'EXP-DH-DSS-DES-CBC-SHA',
        'EXP-DES-CBC-SHA',
        'EXP-RC2-CBC-MD5',
        'EXP-RC4-MD5',
        'ECDHE-RSA-NULL-SHA',
        'ECDHE-ECDSA-NULL-SHA',
        'AECDH-NULL-SHA',
        'ECDH-RSA-NULL-SHA',
        'ECDH-ECDSA-NULL-SHA',
        'NULL-SHA256',
        'NULL-SHA',
        'NULL-MD5'];

var badCipherSuites = ['ECDHE-RSA-DES-CBC3-SHA',
    'ECDHE-ECDSA-DES-CBC3-SHA',
    'EDH-RSA-DES-CBC3-SHA',
    'EDH-DSS-DES-CBC3-SHA',
    'DH-RSA-DES-CBC3-SHA',
    'DH-DSS-DES-CBC3-SHA',
    'ECDH-RSA-DES-CBC3-SHA',
    'ECDH-ECDSA-DES-CBC3-SHA',
    'DES-CBC3-SHA',
    'EDH-RSA-DES-CBC-SHA',
    'EDH-DSS-DES-CBC-SHA',
    'DH-RSA-DES-CBC-SHA',
    'DH-DSS-DES-CBC-SHA',
    'DES-CBC-SHA',
    'EXP-EDH-RSA-DES-CBC-SHA',
    'EXP-EDH-DSS-DES-CBC-SHA',
    'EXP-DH-RSA-DES-CBC-SHA',
    'EXP-DH-DSS-DES-CBC-SHA',
    'EXP-DES-CBC-SHA',
    'EXP-EDH-RSA-DES-CBC-SHA',
    'EXP-EDH-DSS-DES-CBC-SHA',
    'EXP-DH-RSA-DES-CBC-SHA',
    'EXP-DH-DSS-DES-CBC-SHA',
    'EXP-DES-CBC-SHA',
    'EXP-RC2-CBC-MD5',
    'EXP-RC4-MD5',
    'RC4-MD5',
    'EXP-RC2-CBC-MD5',
    'EXP-RC4-MD5',
    'ECDHE-RSA-RC4-SHA',
    'ECDHE-ECDSA-RC4-SHA',
    'ECDH-RSA-RC4-SHA',
    'ECDH-ECDSA-RC4-SHA',
    'RC4-SHA',
    'RC4-MD5',
    'PSK-RC4-SHA',
    'EXP-RC4-MD5',
    'ECDHE-RSA-NULL-SHA',
    'ECDHE-ECDSA-NULL-SHA',
    'AECDH-NULL-SHA',
    'RC4-SHA',
    'RC4-MD5',
    'ECDH-RSA-NULL-SHA',
    'ECDH-ECDSA-NULL-SHA',
    'NULL-SHA256',
    'NULL-SHA',
    'NULL-MD5'];