var method = require('./method'),
    certificate = require('./certificate'),
    cipher = require('./cipher');

module.exports = {
    getServerResults: function(hostData) {
        return certificate.getCertResults(hostData)
            .then(method.getSSLResults)
            .then(cipher.getCipherResults);
    }
};
