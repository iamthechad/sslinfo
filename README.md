[![NPM](https://nodei.co/npm/sslinfo.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/sslinfo/)

[![npm version](https://badge.fury.io/js/sslinfo.svg)](http://badge.fury.io/js/sslinfo)
[![Maintainability](https://api.codeclimate.com/v1/badges/3aafdc7d7d59561f128e/maintainability)](https://codeclimate.com/github/iamthechad/sslinfo/maintainability)
[![Dependency Status](https://david-dm.org/iamthechad/sslinfo.svg)](https://david-dm.org/iamthechad/sslinfo)
[![License](http://img.shields.io/:license-apache-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)
[![Known Vulnerabilities](https://snyk.io/test/github/iamthechad/sslinfo/badge.svg?targetFile=package.json)](https://snyk.io/test/github/iamthechad/sslinfo?targetFile=package.json)
![Maintenance](https://img.shields.io/maintenance/yes/2018)
[![Badges](http://img.shields.io/:badges-7/7-ff6799.svg)](https://github.com/badges/badgerbadgerbadger)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [SSL Info](#ssl-info)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Get the server certificate, enabled SSL/TLS protocols, and supported ciphers.](#get-the-server-certificate-enabled-ssltls-protocols-and-supported-ciphers)
    - [Get only the certificate information for a server](#get-only-the-certificate-information-for-a-server)
    - [Get information about the installed OpenSSL version](#get-information-about-the-installed-openssl-version)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

SSL Info
=========

Utility library for determining which SSL/TLS versions and ciphers a server supports

## Installation

  **This module requires NodeJS v6.9 or higher**

  `npm install sslinfo --save`

  **Note**: This library requires an OpenSSL installation - the newer the better.

## Usage

### Get the server certificate, enabled SSL/TLS protocols, and supported ciphers.

    var sslinfo = require('sslinfo');

    sslinfo.getServerResults({ host: "www.google.com", port: 443 })
        .done(function (results) {
            console.log(results);
        },
        function (error) {
            console.log("Error", {error: error})
        });

**Note:** To get results from servers which support SNI (all servers of cloudflare for example), specify which `servername` should be transmitted to the remote server:

    sslinfo.getServerResults({ host: "www.cloudflare.com", port: 443, servername: "www.cloudflare.com" })

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
        "certPEM": '... PEM encoded certificate ...',
        "protocols": [
            {
                "protocol": "SSLv2_method",
                "name": "SSLv2",
                "enabled": false,
                "error": "This version of NodeJS does not support \"SSLv2_method\""
            }
        ]
    }

### Get only the certificate information for a server

    var sslinfo = require('sslinfo');

    sslinfo.getCertificateInfo({ host: "www.google.com", port: 443 })
        .done(function (results) {
            console.log(results);
        },
        function (error) {
            console.log("Error", {error: error})
        });

The `getCertificateInfo()` function returns a promise that should be resolved by implementing `done()`.

Sample output:

    {
        "host": "www.google.com",
        "port": 443,
        "cert": {
            { version: 2,
                 subject:
                  { countryName: 'US',
                    stateOrProvinceName: 'California',
                    localityName: 'Mountain View',
                    organizationName: 'Google Inc',
                    commonName: 'www.google.com' },
                 issuer:
                  { countryName: 'US',
                    organizationName: 'Google Inc',
                    commonName: 'Google Internet Authority G2' },
                 ... more cert info ...
        },
        "certPEM": '... PEM encoded certificate ...'
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
