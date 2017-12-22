require('dotenv').config();
const path = require('path'),
  bunyan = require('bunyan'),
  util = require('util'),
  _ = require('lodash'),
  ipcExec = require('../utils/ipcExec'),
  mongoose = require('mongoose'),
  Promise = require('bluebird'),
  log = bunyan.createLogger({name: 'core.rest'});

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

let config = {
  mongo: {
    accounts: {
      uri: process.env.MONGO_ACCOUNTS_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: process.env.MONGO_COLLECTION_PREFIX || 'bitcoin'
    },
    data: {
      uri: process.env.MONGO_DATA_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: process.env.MONGO_DATA_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'eth',
      useData: parseInt(process.env.USE_MONGO_DATA) || 0
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
  node: {
    ipcName: process.env.IPC_NAME || 'bitcoin',
    ipcPath: process.env.IPC_PATH || '/tmp/'
  },
  nodered: {
    mongo: {
      uri: process.env.NODERED_MONGO_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data'
    },
    autoSyncMigrations: _.isString(process.env.NODERED_AUTO_SYNC_MIGRATIONS) ? parseInt(process.env.NODERED_AUTO_SYNC_MIGRATIONS) : true,
    httpAdminRoot: '/admin',
    httpNodeRoot: '/',
    debugMaxLength: 1000,
    nodesDir: path.join(__dirname, '../'),
    autoInstallModules: true,
    functionGlobalContext: {
      _: require('lodash'),
      factories: {
        messages: {
          address: require('../factories/messages/addressMessageFactory'),
          generic: require('../factories/messages/genericMessageFactory'),
          tx: require('../factories/messages/txMessageFactory')
        }
      }
    },
    logging: {
      console: {
        level: 'info',
        metrics: true,
        handler: () =>
          (msg) => {
            log.info(util.inspect(msg, null, 3));
          }
      }
    }
  }
};

module.exports = (() => {
  mongoose.Promise = Promise;

  mongoose.red = mongoose.createConnection(config.nodered.mongo.uri);
  mongoose.accounts = mongoose.createConnection(config.mongo.accounts.uri);

  if (config.mongo.data.useData)
    mongoose.data = mongoose.createConnection(config.mongo.data.uri);

  config.nodered.adminAuth = require('../controllers/nodeRedAuthController');
  config.nodered.storageModule = require('../controllers/nodeRedStorageController');
  config.nodered.functionGlobalContext.rpc = (...args) => ipcExec.bind(this, config)(...args);
  return config;
})();
