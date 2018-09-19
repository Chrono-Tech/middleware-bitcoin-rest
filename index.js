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
  
  AmqpService = require('middleware-common-infrastructure/AmqpService'),
  InfrastructureInfo = require('middleware-common-infrastructure/InfrastructureInfo'),
  InfrastructureService = require('middleware-common-infrastructure/InfrastructureService'),

  migrator = require('middleware_service.sdk').migrator,
  models = require('./models'),
  redInitter = require('middleware_service.sdk').init;

/**
 * @module entry point
 * @description expose an express web server for txs
 * and addresses manipulation
 */

const runInfrastucture = async function () {
  const rabbit = new AmqpService(
    config.infrastructureRabbit.url, 
    config.infrastructureRabbit.exchange,
    config.infrastructureRabbit.serviceName
  );
  const info = InfrastructureInfo(require('./package.json'));
  const infrastructure = new InfrastructureService(info, rabbit, {checkInterval: 10000});
  await infrastructure.start();
  infrastructure.on(infrastructure.REQUIREMENT_ERROR, ({requirement, version}) => {
    log.error(`Not found requirement with name ${requirement.name} version=${requirement.version}.` +
        ` Last version of this middleware=${version}`);
    process.exit(1);
  });
  await infrastructure.checkRequirements();
  infrastructure.periodicallyCheck();
};

mongoose.Promise = Promise;
mongoose.accounts = mongoose.createConnection(config.mongo.accounts.uri, {useMongoClient: true});
mongoose.profile = mongoose.createConnection(config.mongo.profile.uri, {useMongoClient: true});
mongoose.data = mongoose.createConnection(config.mongo.data.uri, {useMongoClient: true});

const init = async () => {

  _.chain([mongoose.accounts, mongoose.data])
    .compact().forEach(connection =>
      connection.on('disconnected', () => {
        throw new Error('mongo disconnected!');
      })
    ).value();

  models.init();

  if (config.checkInfrastructure)
    await runInfrastucture();

  let conn = await amqp.connect(config.rabbit.url);
  let channel = await conn.createChannel();

  channel.on('close', () => {
    throw new Error('rabbitmq process has finished!');
  });

  await channel.assertExchange('internal', 'topic', {durable: false});
  await config.nodered.functionGlobalContext.node.provider.setRabbitmqChannel(channel, config.rabbit.serviceName);

  if (config.nodered.autoSyncMigrations)
    await migrator.run(config, path.join(__dirname, 'migrations'));

  redInitter(config);

};

module.exports = init().catch((e) => {
  log.error(e);
  process.exit(1);
});
