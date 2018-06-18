# middleware-bitcoin-rest [![Build Status](https://travis-ci.org/ChronoBank/middleware-bitcoin-rest.svg?branch=master)](https://travis-ci.org/ChronoBank/middleware-bitcoin-rest)

Middleware service for which expose rest api

### Installation

This module is a part of middleware services. You can install it in 2 ways:

1) through core middleware installer  [middleware installer](https://www.npmjs.com/package/chronobank-middleware)
2) by hands: just clone the repo, do 'npm install', set your .env - and you are ready to go

#### About
This module is used for interaction with middleware. This happens through the layer, which is built on chronobank [sdk](https://github.com/ChronoBank/middleware-service-sdk).
So, you don't need to write any code - you can create your own flow with UI tool supplied by node-red itself. Access by this route:
```
/admin
````


### Migrations
Migrations includes the predefined users for node-red (in order to access /admin route), and already predefined flows.
In order to apply migrations, type:
```
npm run migrate_red
```
The migrator wil look for the mongo_db connection string in ecosystem.config.js, in .env or from args. In case, you want run migrator with argument, you can do it like so:
```
npm run migrate_red mongodb://localhost:27017/data
```

#### Predefined Routes with node-red flows


The available routes are listed below:

| route | methods | params | description |
| ------ | ------ | ------ | ------ |
| /addr   | POST | ``` {address: <string>} ``` | register new address on middleware.
| /addr   | DELETE | ``` {address: <string>} ``` | remove an address from middleware
| /addr/{address}/balance   | GET |  | retrieve balance of the registered address
| /addr/{address}/utxo   | GET | |returns an array of unspent transactions (utxo)
| /tx/send   | POST |  ``` {tx: <string>} ``` - raw encoded transaction | broadcast new transaction to network
| /tx/{address}/history   | GET |  | retrieve transactions for the registered adresses [use skip and limit paramters].



##### сonfigure your .env

To apply your configuration, create a .env file in root folder of repo (in case it's not present already).
Below is the expamle configuration:

```
MONGO_URI=mongodb://localhost:271017/data
MONGO_COLLECTION_PREFIX=bitcoin
REST_PORT=8081
IPC_NAME=bitcoin
IPC_PATH=/tmp/
NODERED_MONGO_URI=mongodb://localhost:27018/data
NODERED_AUTO_SYNC_MIGRATIONS=true
HTTP_ADMIN=/admin
```

The options are presented below:

| name | description|
| ------ | ------ |
| MONGO_URI   | the URI string for mongo connection
| MONGO_COLLECTION_PREFIX   | the prefix name for all created collections, like for Account model - it will be called (in our case) bitcoinAccount
| REST_PORT   | rest plugin port
| RABBIT_URI   | rabbitmq URI connection string
| NETWORK   | network name (alias)- is used for connecting via ipc (regtest, main, testnet, bcc)
| DB_DRIVER   | bitcoin database driver (leveldb or memory)
| DB_PATH   | path where to store db (with memory db you can skip this option)
| IPC_NAME   | ipc file name
| IPC_PATH   | directory, where to store ipc file (you can skip this option on windows)
| NODERED_MONGO_URI   | the URI string for mongo collection for keeping node-red users and flows (optional, if omitted - then default MONGO_URI will be used)
| NODERED_AUTO_SYNC_MIGRATIONS   | autosync migrations on start (default = yes)
| HTTP_ADMIN | admin path for nodered or false (if not publish as default)



License
----
 [GNU AGPLv3](LICENSE)

Copyright
----
LaborX PTY