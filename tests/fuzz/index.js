/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const config = require('../config'),
  spawn = require('child_process').spawn,
  Promise = require('bluebird'),
  _ = require('lodash'),
  request = require('request-promise'),
  models = require('../../models'),
  killProcess = require('../helpers/killProcess'),
  expect = require('chai').expect,
  url = config.dev.url,
  authTests = require('./auth'),
  addressTests = require('./address');


module.exports = (ctx) => {

  before(async () => {
    ctx.amqp.channel = await ctx.amqp.instance.createChannel();
    ctx.amqp.channel.prefetch(1);

    await models.blockModel.remove({});
    await models.txModel.remove({});
    await models.coinModel.remove({});

    ctx.restPid = spawn('node', ['index.js'], {env: process.env, stdio: 'ignore'});
    await Promise.delay(10000);
  });

  after('kill environment', async () => {
    await ctx.amqp.channel.close();
    await killProcess(ctx.restPid);
  });

  describe('auth', () => authTests(ctx));
  describe('address', () => addressTests(ctx));

  it('kill rest server and up already - work GET /tx/:hash', async () => {
    await killProcess(ctx.restPid);
    ctx.restPid = spawn('node', ['index.js'], {env: process.env, stdio: 'ignore'});
    await Promise.delay(10000);

    const hash = 'TESTHASH2';
    const address = _.fill(new Array(36), 'a').join('');
    await models.txModel.findOneAndUpdate({'_id': hash}, {
      index: 3,
      timestamp: 6,
      blockNumber: 1
    }, {upsert: true});

    await models.coinModel.findOneAndUpdate({'_id': 'third'}, {
      outputBlock: 1,
      outputTxIndex: 3,
      address
    }, {upsert: true});

    const response = await request(`${url}/tx/${hash}`, {
      method: 'GET',
      json: true,
      headers: {
        Authorization: `Bearer ${config.dev.laborx.token}`
      }
    });

    expect(response).to.deep.equal({
      index: 3,
      timestamp: 6,
      outputs: [{address}],
      inputs: [],
      confirmations: -1,
      blockNumber: 1,
      hash: hash
    });
  });


};
