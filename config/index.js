/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

require('dotenv').config();
const path = require('path'),
  _ = require('lodash'),
  networks = require('middleware-common-components/factories/btcNetworks'),
  providerService = require('../services/providerService'),
  mongoose = require('mongoose'),
  accountPrefix = process.env.MONGO_ACCOUNTS_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'bitcoin',
  profilePrefix = process.env.MONGO_PROFILE_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'bitcoin',
  collectionPrefix = process.env.MONGO_DATA_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'bitcoin',
  rabbit = {
    url: process.env.RABBIT_URI || 'amqp://localhost:5672',
    serviceName: process.env.RABBIT_SERVICE_NAME || 'app_bitcoin'
  };


/** @function
 * @description build default connection URI
 * @returns {string}
 */

const getDefault = () => {
  return (
    (process.env.CONNECTION_URI || `${process.env.IPC_PATH || '/tmp/'}${process.env.IPC_NAME || 'bitcoin'}`) + '@' +
    (process.env.ZMQ || 'tcp://127.0.0.1:43332')
  );
};

/**
 * @function
 * @description return the array of providers
 * @param providers - the string of providers
 * @returns Array<{uri: String, zmq: String}>
 */

const createConfigProviders = (providers) => {
  return _.chain(providers)
    .split(',')
    .map(provider => {
      const data = provider.split('@');
      return {
        uri: data.length === 3 ? `${data[0].trim()}@${data[1]}` : data[0].trim(),
        zmq: (data.length === 3 ? data[2] : data[1]).trim()
      };
    })
    .value();
};

const providers = createConfigProviders(process.env.PROVIDERS || getDefault());

/**
 * @factory config
 * @description base app's configuration
 * @returns {{
 *    mongo: {
 *      uri: string,
 *      collectionPrefix: string
 *      },
 *    rest: {
 *      domain: string,
 *      port: number
 *      },
 *    node: {
 *      ipcName: string,
 *      ipcPath: string
 *      }
 *    }}
 */

const config = {
  mongo: {
    accounts: {
      uri: process.env.MONGO_ACCOUNTS_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: accountPrefix
    },
    profile: {
      uri: process.env.MONGO_PROFILE_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: profilePrefix
    },
    data: {
      uri: process.env.MONGO_DATA_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix,
      useData: parseInt(process.env.USE_MONGO_DATA) || 1
    }
  },
  rabbit,
  rest: {
    domain: process.env.DOMAIN || 'localhost',
    port: parseInt(process.env.REST_PORT) || 8081
  },
  nodered: {
    mongo: {
      uri: process.env.NODERED_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: process.env.NODE_RED_MONGO_COLLECTION_PREFIX || '',
    },
    logging: {
      console: {
        level: process.env.LOG_LEVEL || 'info'
      }
    },
    autoSyncMigrations: _.isString(process.env.NODERED_AUTO_SYNC_MIGRATIONS) ? parseInt(process.env.NODERED_AUTO_SYNC_MIGRATIONS) : true,
    migrationsInOneFile: true,
    httpAdminRoot: process.env.HTTP_ADMIN || false,
    customNodesDir: [path.join(__dirname, '../')],
    migrationsDir: path.join(__dirname, '../migrations'),
    functionGlobalContext: {
      connections: {
        primary: mongoose
      },
      settings: {
        mongo: {
          accountPrefix,
          collectionPrefix
        },
        rabbit,
        laborx: {
          useAuth: process.env.LABORX_USE_AUTH ? parseInt(process.env.LABORX_USE_AUTH) : false,
          url: process.env.LABORX_RABBIT_URI || 'amqp://localhost:5672',
          serviceName: process.env.LABORX_RABBIT_SERVICE_NAME || '',
          authProvider: process.env.LABORX || 'http://localhost:3001/api/v1/security',
          profileModel: profilePrefix + 'Profile',
          dbAlias: 'profile'
        }
      },
      node: {
        provider: new providerService(providers),
        network: networks[process.env.NETWORK || 'regtest']
      }
    }
  }
};

module.exports = config;
