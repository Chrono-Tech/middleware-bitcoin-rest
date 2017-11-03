# middleware-bitcoin-rest [![Build Status](https://travis-ci.org/ChronoBank/middleware-bitcoin-rest.svg?branch=master)](https://travis-ci.org/ChronoBank/middleware-bitcoin-rest)

Bitcoin Middleware service for exposing rest api

### Installation

This module is a part of middleware services. You can install it in 2 ways:

1) through core middleware installer  [middleware installer](https://github.com/ChronoBank/middleware-bitcoin)
2) by hands: just clone the repo, do 'npm install', set your .env - and you are ready to go

#### About
This module is used for interaction with middleware through REST API.


#### Routes


The available routes are listed below:

| route | methods | params | description |
| ------ | ------ | ------ | ------ |
| ```/addr```   | POST |address - user's address |register a new account
| ```/addr```   | DELETE |address - user's address | remove registered account
| ```/addr/<address>/balance```   | GET | |return address's balance for 0-3-6 confirmations
| ```/addr/<address>/utxo```   | GET | |returns an array of unspent transactions (utxo)
| ```/tx/send```   | POST | tx - raw encoded transaction | broadcast new transaction to network


##### сonfigure your .env

To apply your configuration, create a .env file in root folder of repo (in case it's not present already).
Below is the expamle configuration:

```
MONGO_URI=mongodb://localhost:271017/data
MONGO_COLLECTION_PREFIX=bitcoin
REST_PORT=8081
IPC_NAME=bitcoin
IPC_PATH=/tmp/
```

The options are presented below:

| name | description|
| ------ | ------ |
| MONGO_URI   | the URI string for mongo connection
| MONGO_COLLECTION_PREFIX   | the prefix name for all created collections, like for Account model - it will be called (in our case) BitcoinAccount
| REST_PORT   | rest plugin port
| IPC_NAME   | ipc file name
| IPC_PATH   | directory, where to store ipc file (you can skip this option on windows)

### Testing
In order to test API you have to:
1) Download & install Postman https://www.getpostman.com/
2) Import rest endpoints collection (postman/bitcoin-rest-api.postman_collection)
3) Setup Environment, using server, port variables for linking your REST server. Optionally you can use addr variable.

License
----

MIT