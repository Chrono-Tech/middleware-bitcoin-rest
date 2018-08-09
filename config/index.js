/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

require('dotenv').config();
const path = require('path'),
  _ = require('lodash'),
  providerService = require('../services/providerService'),
  mongoose = require('mongoose');


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
      collectionPrefix: process.env.MONGO_ACCOUNTS_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'bitcoin'
    },
    data: {
      uri: process.env.MONGO_DATA_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: process.env.MONGO_DATA_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'bitcoin',
      useData: parseInt(process.env.USE_MONGO_DATA) || 1
    }
  },
  rabbit: {
    url: process.env.RABBIT_URI || 'amqp://localhost:5672',
    serviceName: process.env.RABBIT_SERVICE_NAME || 'app_bitcoin'
  },
  rest: {
    domain: process.env.DOMAIN || 'localhost',
    port: parseInt(process.env.REST_PORT) || 8081
  },
  nodered: {
    mongo: {
      uri: process.env.NODERED_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data'
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
          accountPrefix: process.env.MONGO_ACCOUNTS_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'bitcoin',
          collectionPrefix: process.env.MONGO_DATA_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'bitcoin'
        },
        rabbit: {
          url: process.env.RABBIT_URI || 'amqp://localhost:5672',
          serviceName: process.env.RABBIT_SERVICE_NAME || 'app_bitcoin'
        }
      },
      node: {
        provider: new providerService(providers)
      }
    }
  }
};

module.exports = config;
