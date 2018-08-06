/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

const config = require('./config'),
  mongoose = require('mongoose'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'core.rest'}),
  path = require('path'),
  _ = require('lodash'),
  amqp = require('amqplib'),
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

const init = async () => {

  _.chain([mongoose.accounts, mongoose.data])
    .compact().forEach(connection =>
    connection.on('disconnected', () => {
      throw new Error('mongo disconnected!');
    })
  ).value();

  let conn = await amqp.connect(config.rabbit.url);
  let channel = await conn.createChannel();

  channel.on('close', () => {
    throw new Error('rabbitmq process has finished!');
  });

  await config.nodered.functionGlobalContext.node.provider.setRabbitmqChannel(channel, config.rabbit.serviceName);

  require('require-all')({
    dirname: path.join(__dirname, '/models'),
    filter: /(.+Model)\.js$/
  });

  if (config.nodered.autoSyncMigrations)
    await migrator.run(config.nodered.mongo.uri, path.join(__dirname, 'migrations'));

  redInitter(config);

};

module.exports = init().catch((e) => {
  log.error(e);
  process.exit(1);
});
