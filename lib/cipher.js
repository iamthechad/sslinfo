var tls = require('tls'),
    Q = require('q'),
    _ = require('lodash'),
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
                var tasks = getCiphersSuitesForProtocol(item.protocol).map(function (d) {
                    return trySSLCipher({
                        host: hostData.host,
                        port: hostData.port,
                        secureProtocol: item.protocol,
                        protocolCommonName: item.name,
                        ciphers: d
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
                        name: item.protocolCommonName,
                        enabled: [],
                        disabled: [],
                        unsupported: []
                    };
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
     * Get the list of all cipher suites known by this tool.
     * @returns {string[]}
     */
    cipherSuites: function () {
        return _.union(commonBase, sslV3CipherSuites, tlsCipherSuites, tls12CipherSuites, extraCipherSuites);
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

    var fullOptions = {
        rejectUnauthorized: false
    };
    fullOptions = _.extend(fullOptions, options);

    var socket = tls.connect(fullOptions, function() {
        deferred.resolve({protocol: options.secureProtocol, protocolCommonName: options.protocolCommonName, cipher: options.ciphers, enabled: true});
        socket.end();
    });
    socket.setEncoding('utf8');
    socket.on('error', function(error) {
        var errorString = error.toString();
        if ((errorString.indexOf("socket hang up") !== -1) || (errorString.indexOf("handshake failure") !== -1)) {
            deferred.resolve({protocol: options.secureProtocol, protocolCommonName: options.protocolCommonName, cipher: options.ciphers, enabled: false});
        } else if (errorString.indexOf('no ciphers available') !== -1) {
            deferred.resolve({protocol: options.secureProtocol, protocolCommonName: options.protocolCommonName, cipher: options.ciphers, enabled: false, unsupported: true});
        } else {
            console.log(errorString);
            deferred.reject({
                host: options.host,
                port: options.port,
                protocol: options.secureProtocol,
                protocolCommonName: options.protocolCommonName,
                cipher: options.ciphers,
                error: error
            });
        }
        socket.end();
    });
    return deferred.promise;
}

function getCiphersSuitesForProtocol(protocol) {
    switch (protocol) {
        case method.methods().SSLv2_method.name:
            return [];
        case method.methods().SSLv3_method.name:
            return _.union(commonBase, sslV3CipherSuites);
        case method.methods().TLSv1_method.name:
        case method.methods().TLSv1_1_method.name:
            return _.union(commonBase, tlsCipherSuites);
        case method.methods().TLSv1_2_method.name:
            return _.union(commonBase, tlsCipherSuites, tls12CipherSuites);
        default:
            console.log("Invalid protocol specified: " + protocol);
            return [ 'INVALID_PROTOCOL_' + protocol ];
    }
}

var commonBase = [ 'NULL-MD5',
    'NULL-SHA',
    'EXP-RC4-MD5',
    'RC4-MD5',
    'RC4-SHA',
    'EXP-RC2-CBC-MD5',
    'IDEA-CBC-SHA',
    'EXP-DES-CBC-SHA',
    'DES-CBC-SHA',
    'DES-CBC3-SHA',
    'EXP-DHE-DSS-DES-CBC-SHA',
    'DHE-DSS-CBC-SHA',
    'DHE-DSS-DES-CBC3-SHA',
    'EXP-DHE-RSA-DES-CBC-SHA',
    'DHE-RSA-DES-CBC-SHA',
    'DHE-RSA-DES-CBC3-SHA',
    'EXP-ADH-RC4-MD5',
    'ADH-RC4-MD5',
    'EXP-ADH-DES-CBC-SHA',
    'ADH-DES-CBC-SHA',
    'ADH-DES-CBC3-SHA',
    'EXP1024-DES-CBC-SHA',
    'EXP1024-RC4-SHA',
    'EXP1024-DHE-DSS-DES-CBC-SHA',
    'EXP1024-DHE-DSS-RC4-SHA',
    'DHE-DSS-RC4-SHA' ];

var sslV3CipherSuites = [
    'EXP-DH-DSS-DES-CBC-SHA',
    'DH-DSS-DES-CBC-SHA',
    'DH-DSS-DES-CBC3-SHA',
    'EXP-DH-RSA-DES-CBC-SHA',
    'DH-RSA-DES-CBC-SHA',
    'DH-RSA-DES-CBC3-SHA'
];

var tlsCipherSuites= [
    'AES128-SHA',
    'AES256-SHA',
    'DH-DSS-AES128-SHA',
    'DH-DSS-AES256-SHA',
    'DH-RSA-AES128-SHA',
    'DH-RSA-AES256-SHA',
    'DHE-DSS-AES128-SHA',
    'DHE-DSS-AES256-SHA',
    'DHE-RSA-AES128-SHA',
    'DHE-RSA-AES256-SHA',
    'ADH-AES128-SHA',
    'ADH-AES256-SHA',
    'CAMELLIA128-SHA',
    'CAMELLIA256-SHA',
    'DH-DSS-CAMELLIA128-SHA',
    'DH-DSS-CAMELLIA256-SHA',
    'DH-RSA-CAMELLIA128-SHA',
    'DH-RSA-CAMELLIA256-SHA',
    'DHE-DSS-CAMELLIA128-SHA',
    'DHE-DSS-CAMELLIA256-SHA',
    'DHE-RSA-CAMELLIA128-SHA',
    'DHE-RSA-CAMELLIA256-SHA',
    'ADH-CAMELLIA128-SHA',
    'ADH-CAMELLIA256-SHA',
    'SEED-SHA',
    'DH-DSS-SEED-SHA',
    'DH-RSA-SEED-SHA',
    'DHE-DSS-SEED-SHA',
    'DHE-RSA-SEED-SHA',
    'ADH-SEED-SHA',
    'ECDH-RSA-NULL-SHA',
    'ECDH-RSA-RC4-SHA',
    'ECDH-RSA-DES-CBC3-SHA',
    'ECDH-RSA-AES128-SHA',
    'ECDH-RSA-AES256-SHA',
    'ECDH-ECDSA-NULL-SHA',
    'ECDH-ECDSA-RC4-SHA',
    'ECDH-ECDSA-DES-CBC3-SHA',
    'ECDH-ECDSA-AES128-SHA',
    'ECDH-ECDSA-AES256-SHA',
    'ECDHE-RSA-NULL-SHA',
    'ECDHE-RSA-RC4-SHA',
    'ECDHE-RSA-DES-CBC3-SHA',
    'ECDHE-RSA-AES128-SHA',
    'ECDHE-RSA-AES256-SHA',
    'ECDHE-ECDSA-NULL-SHA',
    'ECDHE-ECDSA-RC4-SHA',
    'ECDHE-ECDSA-DES-CBC3-SHA',
    'ECDHE-ECDSA-AES128-SHA',
    'ECDHE-ECDSA-AES256-SHA',
    'AECDH-NULL-SHA',
    'AECDH-RC4-SHA',
    'AECDH-DES-CBC3-SHA',
    'AECDH-AES128-SHA',
    'AECDH-AES256-SHA'
];

var tls12CipherSuites = [
    'NULL-SHA256',
    'AES128-SHA256',
    'AES256-SHA256',
    'AES128-GCM-SHA256',
    'AES256-GCM-SHA384',
    'DH-RSA-AES128-SHA256',
    'DH-RSA-AES256-SHA256',
    'DH-RSA-AES128-GCM-SHA256',
    'DH-RSA-AES256-GCM-SHA384',
    'DH-DSS-AES128-SHA256',
    'DH-DSS-AES256-SHA256',
    'DH-DSS-AES128-GCM-SHA256',
    'DH-DSS-AES256-GCM-SHA384',
    'DHE-RSA-AES128-SHA256',
    'DHE-RSA-AES256-SHA256',
    'DHE-RSA-AES128-GCM-SHA256',
    'DHE-RSA-AES256-GCM-SHA384',
    'DHE-DSS-AES128-SHA256',
    'DHE-DSS-AES256-SHA256',
    'DHE-DSS-AES128-GCM-SHA256',
    'DHE-DSS-AES256-GCM-SHA384',
    'ECDH-RSA-AES128-SHA256',
    'ECDH-RSA-AES256-SHA384',
    'ECDH-RSA-AES128-GCM-SHA256',
    'ECDH-RSA-AES256-GCM-SHA384',
    'ECDH-ECDSA-AES128-SHA256',
    'ECDH-ECDSA-AES256-SHA384',
    'ECDH-ECDSA-AES128-GCM-SHA256',
    'ECDH-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA384',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-AES128-SHA256',
    'ECDHE-ECDSA-AES256-SHA384',
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ADH-AES128-SHA256',
    'ADH-AES256-SHA256',
    'ADH-AES128-GCM-SHA256',
    'ADH-AES256-GCM-SHA384',
    'ECDHE-ECDSA-CAMELLIA128-SHA256',
    'ECDHE-ECDSA-CAMELLIA256-SHA384',
    'ECDH-ECDSA-CAMELLIA128-SHA256',
    'ECDH-ECDSA-CAMELLIA256-SHA384',
    'ECDHE-RSA-CAMELLIA128-SHA256',
    'ECDHE-RSA-CAMELLIA256-SHA384',
    'ECDH-RSA-CAMELLIA128-SHA256',
    'ECDH-RSA-CAMELLIA256-SHA384'
];

var extraCipherSuites = [ 'SRP-DSS-AES-256-CBC-SHA',
    'SRP-RSA-AES-256-CBC-SHA',
    'SRP-AES-256-CBC-SHA',
    'PSK-AES256-CBC-SHA',
    'SRP-DSS-AES-128-CBC-SHA',
    'SRP-RSA-AES-128-CBC-SHA',
    'SRP-AES-128-CBC-SHA',
    'PSK-AES128-CBC-SHA',
    'PSK-RC4-SHA',
    'SRP-DSS-3DES-EDE-CBC-SHA',
    'SRP-RSA-3DES-EDE-CBC-SHA',
    'SRP-3DES-EDE-CBC-SHA',
    'EDH-RSA-DES-CBC3-SHA',
    'EDH-DSS-DES-CBC3-SHA',
    'PSK-3DES-EDE-CBC-SHA',
    'EDH-RSA-DES-CBC-SHA',
    'EDH-DSS-DES-CBC-SHA',
    'EXP-EDH-RSA-DES-CBC-SHA',
    'EXP-EDH-DSS-DES-CBC-SHA' ];

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