[![NPM](https://nodei.co/npm/sslinfo.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/sslinfo/) 

[![npm version](https://badge.fury.io/js/sslinfo.svg)](http://badge.fury.io/js/sslinfo)
[![Dependency Status](https://david-dm.org/iamthechad/sslinfo.svg)](https://david-dm.org/iamthechad/sslinfo)
[![License](http://img.shields.io/:license-apache-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)
[![Stories in Ready](https://badge.waffle.io/iamthechad/sslinfo.svg?label=ready&title=Ready)](http://waffle.io/iamthechad/sslinfo)
[![Badges](http://img.shields.io/:badges-5/5-ff6799.svg)](https://github.com/badges/badgerbadgerbadger)

**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [SSL Info](#ssl-info)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Get the server certificate, enabled SSL/TLS protocols, and supported ciphers.](#get-the-server-certificate-enabled-ssltls-protocols-and-supported-ciphers)
    - [Get information about the installed OpenSSL version](#get-information-about-the-installed-openssl-version)
  - [Release History](#release-history)

SSL Info
=========

Utility library for determining which SSL/TLS versions and ciphers a server supports

## Installation

  **This module requires NodeJS 0.12.0 or higher. It will not work on older versions!**
  
  **You may need to install node-gyp first globally: `npm install -g node-gyp` (use `sudo` if needed)**

  `npm install sslinfo --save`
  
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
                "name": "SSLv2",
                "enabled": false,
                "error": "The installed openssl library does not support \"SSLv2_method\""
            },
            {
                "protocol": "SSLv3_method",
                "name": "SSLv3",
                "enabled": true
            },
            {
                "protocol": "TLSv1_method",
                "name": "TLSv1",
                "enabled": true
            },
            {
                "protocol": "TLSv1_1_method",
                "name": "TLSv1.1",
                "enabled": true
            },
            {
                "protocol": "TLSv1_2_method",
                "name": "TLSv1.2",
                "enabled": true
            }
        ],
        "ciphers": {
            "SSLv3_method": {
                ...
            },
            "TLSv1_method": {
                "name": "TLSv1",
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

**Beginning with NodeJS 4.0.0, SSLv2 and SSLv3 are disabled by default. The sample output will be slightly different in this case.**

    {
        "host": "www.google.com",
        "port": 443,
        "cert": {
            ... certificate information ...
        },
        "protocols": [
            {
                "protocol": "SSLv2_method",
                "name": "SSLv2",
                "enabled": false,
                "error": "This version of NodeJS does not support \"SSLv2_method\""
            }
        ]
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
                "SSLv3",
                "TLSv1",
                "TLSv1.1",
                "TLSv1.2"
            ],
            "unsupported": [
                "SSLv2"
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
    
**Note:** The `unsupported` cipher list is not necessarily correct. I'm going to investigate how to make this information more useful.

## Release History

* 0.1.5 Fix crash when trying to use SSLv2 or SSLv3 on versions of NodeJS where it's disabled.
* 0.1.4 Update `x509` package dependency version
* 0.1.3 
    * Add "`name`" property in protocols and cipher results to show the common name vs the name that OpenSSL uses.
    * Change results of `getOpenSSLCapabilities()` to use common name of protocols.
* 0.1.2 Rework how cipher detection works. Use appropriate cipher lists for SSLv3 vs TLS1.0/1.1 vs TLS1.2
* 0.1.1 Project housekeeping. No code changes.
* 0.1.0 Initial release