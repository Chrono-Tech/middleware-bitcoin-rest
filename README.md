# middleware-bitcoin-rest [![Build Status](https://travis-ci.org/ChronoBank/middleware-bitcoin-rest.svg?branch=master)](https://travis-ci.org/ChronoBank/middleware-bitcoin-rest)

Middleware service which expose rest api

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
| /tx/{hash}   | GET |  | retrieve transaction by its hash


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
| MONGO_COLLECTION_PREFIX   | the default prefix for all mongo collections. The default value is 'eth'
| MONGO_ACCOUNTS_URI   | the URI string for mongo connection, which holds users accounts (if not specified, then default MONGO_URI connection will be used)
| MONGO_ACCOUNTS_COLLECTION_PREFIX   | the collection prefix for accounts collection in mongo (If not specified, then the default MONGO_COLLECTION_PREFIX will be used)
| MONGO_PROFILE_URI   | the URI string for mongo connection, which holds profile accounts (if not specified, then default MONGO_URI connection will be used) [for token from laborx]
| MONGO_PROFILE_COLLECTION_PREFIX   | the collection prefix for profile collection in mongo (If not specified, then the default MONGO_COLLECTION_PREFIX will be used) [for token from laborx]
| MONGO_DATA_URI   | the URI string for mongo connection, which holds data collections (for instance, processed block's height). In case, it's not specified, then default MONGO_URI connection will be used)
| MONGO_DATA_COLLECTION_PREFIX   | the collection prefix for data collections in mongo (If not specified, then the default MONGO_COLLECTION_PREFIX will be used)
| NODERED_MONGO_URI   | the URI string for mongo connection, which holds data collections (for instance, processed block's height). In case, it's not specified, then default MONGO_URI connection will be used)
| NODE_RED_MONGO_COLLECTION_PREFIX   | the collection prefix for node-red collections in mongo (If not specified, then the collections will be created without prefix)
| REST_PORT   | rest plugin port
| RABBIT_URI   | rabbitmq URI connection string
| DB_PATH   | path where to store db (with memory db you can skip this option)
| IPC_NAME   | ipc file name
| IPC_PATH   | directory, where to store ipc file (you can skip this option on windows)
| NODERED_MONGO_URI   | the URI string for mongo collection for keeping node-red users and flows (optional, if omitted - then default MONGO_URI will be used)
| NODERED_AUTO_SYNC_MIGRATIONS   | autosync migrations on start (default = yes)
| HTTP_ADMIN | admin path for nodered or false (if not publish as default)
| LABORX | url for laborxAuth [default=http://localhost:3001/api/v1/security]
| LABORX_RABBIT_SERVICE_NAME | service name for laborx[exchange=events] in rabbitMq 
| LABORX_RABBIT_URI | rabbit uri for laborx [exchange=events]



License
----
 [GNU AGPLv3](LICENSE)

Copyright
----
LaborX PTY