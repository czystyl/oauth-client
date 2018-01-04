![alt text](https://travis-ci.org/czystyl/oauth-client.svg?branch=feature%2Ftravis)

# OAuth Client

Http client based on [Axios](https://github.com/axios/axios) for using with oauth server.

## Pre requirements

Before use You need to provide set environment variable:

* `APIURL` - baseUrl for Axios instance
* `TOKEN_ENDPOINT` - OAuth server endpoint
* `CLIENT_ID` - OAuth client id
* `CLIENT_SECRET` - OAuth client client_secret

## Usage

Usage is the same like using clean axios, see example [here](https://github.com/axios/axios#example)

> Remember to set environment variable before use client

## Features

* Adding token to each request
* Using refresh token
* Getting token
* Tokens are stored in memory and localStorage
