var Q = require('q'),
    _ = require('underscore'),
    tls = require('tls');

module.exports = {
    /**
     * Return an object containing information about each protocol method.
     * @returns {{SSLv2_method: {name: string, opensslAbbrev: string, order: number}, SSLv3_method: {name: string, opensslAbbrev: string, order: number}, TLSv1_method: {name: string, opensslAbbrev: string, order: number}, TLSv1_1_method: {name: string, opensslAbbrev: string, order: number}, TLSv1_2_method: {name: string, opensslAbbrev: string, order: number}}}
     */
    methods: function () {
        return methods;
    },
    /**
     * Determine which SSL/TLS methods a host supports.
     * @param hostData {{ host: string, port: number }}
     * @return {promise}
     */
    getSSLResults: function (hostData) {
        var tasks = _.values(methods).map(function (d) {
            return _trySSLMethod({host: hostData.host, port: hostData.port, protocol: d});
        });
        return Q.all(tasks).then(function (results) {
            hostData.protocols = [];
            results.forEach(function (item) {
                hostData.protocols.push(item);
            });
            return hostData;
        });
    },
    /**
     * See if a host supports a specific SSL/TLS method
     * @param options {{ host: string, port: number, protocol: { name: string, commonName: string } }}
     * @returns {promise}
     */
    trySSLMethod: function (options) {
        return _trySSLMethod(options);
    }
};

var methods = {
    SSLv2_method: {
        name: "SSLv2_method",
        commonName: "SSLv2"
    },
    SSLv3_method: {
        name: "SSLv3_method",
        commonName: "SSLv3"
    },
    TLSv1_method: {
        name: "TLSv1_method",
        commonName: "TLSv1"
    },
    TLSv1_1_method: {
        name: "TLSv1_1_method",
        commonName: "TLSv1.1"
    },
    TLSv1_2_method: {
        name: "TLSv1_2_method",
        commonName: "TLSv1.2"
    }
};

/**
 * See if a host supports a specific SSL/TLS method
 * @param options {{ host: string, port: number, protocol: { name: string, commonName: string} }}
 * @returns {promise}
 * @private
 */
function _trySSLMethod(options) {
    var fullOptions = {
        rejectUnauthorized: false,
        secureProtocol: options.protocol.name
    };
    fullOptions = _.extend(fullOptions, options);

    var deferred = Q.defer();
    try {
        var socket = tls.connect(fullOptions, function () {
            deferred.resolve({protocol: options.protocol.name, name: options.protocol.commonName, enabled: true});
            socket.end();
        });
        socket.setEncoding('utf8');
        socket.on('error', function (error) {
            if (error.code && error.code === 'ECONNRESET') {
                deferred.resolve({protocol: options.protocol.name, name: options.protocol.commonName, enabled: false});
            } else {
                var msg = error.toString();
                if (msg.indexOf("no ciphers available") !== -1) {
                    deferred.resolve({
                        protocol: options.protocol.name,
                        name: options.protocol.commonName,
                        enabled: false,
                        error: 'The installed openssl library does not support "' + options.protocol.commonName + '"'
                    });
                } else if (msg.indexOf("SSL3_GET_RECORD:wrong version number" !== -1)) {
                    deferred.resolve({
                        protocol: options.protocol.name,
                        name: options.protocol.commonName,
                        enabled: false
                    });
                } else {
                    deferred.reject(error);
                }
            }
        });
    } catch (e) {
        var msg = e.toString();
        if (msg.indexOf("methods disabled") !== -1) {
            deferred.resolve({
                protocol: options.protocol.name,
                name: options.protocol.commonName,
                enabled: false,
                error: 'This version of NodeJS does not support "' + options.protocol.commonName + '"'
            });
        } else {
            deferred.reject(e);
        }
    }
    return deferred.promise
}