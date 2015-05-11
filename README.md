[![Dependency Status](https://david-dm.org/iamthechad/sslinfo.svg)](https://david-dm.org/iamthechad/sslinfo)

SSL Info
=========

Utility library for determining which SSL/TLS versions and ciphers a server supports

## Installation

  **This module requires NodeJS 0.12.0 or higher. It will not work on older versions!**
  
  **You may need to install node-gyp first globally: `npm install -g node-gyp` (use `sudo` if needed)**

  `npm install git://github.com/iamthechad/sslinfo.git --save`
  
  **Note**: This library requires an OpenSSL installation - the newer the better. 

## Usage

### Get the server certificate, enabled SSL/TLS protocols, and supported ciphers.

    var sslinfo = require('sslinfo');

    sslinfo.getServerResults({host: "www.google.com", port: 443})
        .done(function (results) {
            console.log(results);
        },
        function (error) {
            console.log("Error", {error: error})
        });
        
The `getServerResults()` function returns a promise that should be resolved by implementing `done()`.
        
Sample output:

    {
        "host": "www.google.com",
        "port": 443,
        "cert": {
            ... certificate information ...
        },
        "protocols": [
            {
                "protocol": "SSLv2_method",
                "enabled": false,
                "error": "The installed openssl library does not support \"SSLv2_method\""
            },
            {
                "protocol": "SSLv3_method",
                "enabled": true
            },
            {
                "protocol": "TLSv1_method",
                "enabled": true
            },
            {
                "protocol": "TLSv1_1_method",
                "enabled": true
            },
            {
                "protocol": "TLSv1_2_method",
                "enabled": true
            }
        ],
        "ciphers": {
            "SSLv3_method": {
                ...
            },
            "TLSv1_method": {
                "enabled": [
                    ... enabled cipher list ...
                ],
                "disabled": [
                    ... disabled cipher list ...
                ],
                "unsupported": [
                    ... ciphers unsupported by the OpenSSL version ...
                ]
            },
            "TLSv1_1_method": {
                ...
            },
            "TLSv1_2_method": {
                ...
            }
        }
    }
          
          
### Get information about the installed OpenSSL version
    
    var sslinfo = require('sslinfo');
              
    sslinfo.getOpenSSLCapabilities()
        .done(function (results) {
            console.log(results);
        },
        function (error) {
            console.log("Error", {error: error});
        });
        
The `getOpenSSLCapabilities()` function returns a promise that should be resolved by implementing `done()`.
        
Sample output (from Mac OS X 10.10.3):

    {
        "version": "OpenSSL 0.9.8zd 8 Jan 2015",
        "protocols": {
            "supported": [
                "SSLv3_method",
                "TLSv1_method",
                "TLSv1_1_method",
                "TLSv1_2_method"
            ],
            "unsupported": [
                "SSLv2_method"
            ]
        },
        "ciphers": {
            "supported": [
                ... ciphers supported by this OpenSSL version ...
            ],
            "unsupported": [
                ... ciphers supported by this tool, but not the installed OpenSSL version ...
            ]
        }
    }

## Release History

* 0.1.0 Initial release
