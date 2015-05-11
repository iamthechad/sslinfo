[![NPM](https://nodei.co/npm/sslinfo.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/sslinfo/) 

[![Dependency Status](https://david-dm.org/iamthechad/sslinfo.svg)](https://david-dm.org/iamthechad/sslinfo)
[![License](http://img.shields.io/:license-apache-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)
[![Badges](http://img.shields.io/:badges-3/3-ff6799.svg)](https://github.com/badges/badgerbadgerbadger)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [SSL Info](#ssl-info)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Get the server certificate, enabled SSL/TLS protocols, and supported ciphers.](#get-the-server-certificate-enabled-ssltls-protocols-and-supported-ciphers)
    - [Get information about the installed OpenSSL version](#get-information-about-the-installed-openssl-version)
  - [Release History](#release-history)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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
    
**Note:** The `unsupported` cipher list is not necessarily correct. I'm going to investigate how to make this information more useful.

## Release History

* 0.1.0 Initial release
* 0.1.1 Project housekeeping. No code changes.
* 0.1.2 Rework how cipher detection works. Use appropriate cipher lists for SSLv3 vs TLS1.0/1.1 vs TLS1.2
