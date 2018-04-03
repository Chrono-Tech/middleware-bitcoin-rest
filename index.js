const config = require('./config'),
  mongoose = require('mongoose'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'core.rest'}),
  path = require('path'),
  _ = require('lodash'),
  migrator = require('middleware_service.sdk').migrator,
  redInitter = require('middleware_service.sdk').init;

/**
 * @module entry point
 * @description expose an express web server for txs
 * and addresses manipulation
 */


mongoose.Promise = Promise;
mongoose.accounts = mongoose.createConnection(config.mongo.accounts.uri);

if (config.mongo.data.useData)
  mongoose.data = mongoose.createConnection(config.mongo.data.uri);

_.chain([mongoose.accounts, mongoose.data])
  .compact().forEach(connection =>
    connection.on('disconnected', function () {
      log.error('mongo disconnected!');
      process.exit(0);
    })
  ).value();

const init = async () => {

  require('require-all')({
    dirname: path.join(__dirname, '/models'),
    filter: /(.+Model)\.js$/
  });

  if (config.nodered.autoSyncMigrations)
    await migrator.run(config.nodered.mongo.uri, path.join(__dirname, 'migrations'));

  redInitter(config);

};

module.exports = init();
