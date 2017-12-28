require('dotenv/config');

const config = require('../config'),
  Network = require('bcoin/lib/protocol/network'),
  bcoin = require('bcoin'),
  amqp = require('amqplib'),
  ctx = {
    network: null,
    accounts: []
  },
  expect = require('chai').expect,
  accountModel = require('../models/accountModel'),
  ipcExec = require('./helpers/ipcExec'),
  Promise = require('bluebird'),
  request = Promise.promisify(require('request')),
  scope = {},
  mongoose = require('mongoose');

mongoose.Promise = Promise;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('core/rest', function () {

  before(async () => {

    ctx.network = Network.get('regtest');

    let keyPair = bcoin.hd.generate(ctx.network);
    let keyPair2 = bcoin.hd.generate(ctx.network);

    ctx.accounts.push(keyPair, keyPair2);

    mongoose.connect(config.mongo.accounts.uri, {useMongoClient: true});
  });

  after(() => {
    return mongoose.disconnect();
  });

  it('remove registered addresses from mongodb', async () => {

    let keyring = new bcoin.keyring(ctx.accounts[0].privateKey, ctx.network);
    let keyring2 = new bcoin.keyring(ctx.accounts[1].privateKey, ctx.network);

    return await accountModel.remove({
      address: {
        $in: [keyring.getAddress().toString(),
          keyring2.getAddress().toString()]
      }
    })
  });

  it('generate some coins for accountA', async () => {
    scope.height = await ipcExec('getblockcount', []);
    let keyring = new bcoin.keyring(ctx.accounts[0].privateKey, ctx.network);
    return await ipcExec('generatetoaddress', [50, keyring.getAddress().toString()])
  });

  it('unlock coins for account A by generating some coins for accountB', async () => {
    let keyring = new bcoin.keyring(ctx.accounts[1].privateKey, ctx.network);
    let amqpInstance = await amqp.connect(config.rabbit.url);
    let channel = await amqpInstance.createChannel();
    try {
      await channel.assertExchange('events', 'topic', {durable: false});
      await channel.assertQueue(`app_${config.rabbit.serviceName}_test.block`);
      await channel.bindQueue(`app_${config.rabbit.serviceName}_test.block`, 'events', `${config.rabbit.serviceName}_block`);
    } catch (e) {
      channel = await amqpInstance.createChannel();
    }

    return await new Promise(res => {
      channel.consume(`app_${config.rabbit.serviceName}_test.block`, data => {
        let payload = JSON.parse(data.content.toString());
        if (payload.block >= scope.height + 150)
          res();
      }, {noAck: true});
      ipcExec('generatetoaddress', [100, keyring.getAddress().toString()]);
    })
  });


  it('register addresses', async () => {
    await Promise.delay(10000);
    let responses = await Promise.all(ctx.accounts.map(account => {
      let keyring = new bcoin.keyring(account.privateKey, ctx.network);
      return request({
        url: `http://${config.rest.domain}:${config.rest.port}/addr`,
        method: 'post',
        json: {
          address: keyring.getAddress().toString()
        }
      })

    }));

    responses.forEach(resp =>
      expect(resp.body).to.include({code: 1})
    )
  });

  it('validate potential balance changes for accounts', async () => {
    let keyring = new bcoin.keyring(ctx.accounts[0].privateKey, ctx.network);
    let keyring2 = new bcoin.keyring(ctx.accounts[1].privateKey, ctx.network);

    let responses = await Promise.all([
      keyring.getAddress().toString(),
      keyring2.getAddress().toString()
    ].map(address => {
      return request({
        url: `http://${config.rest.domain}:${config.rest.port}/addr/${address}/balance`,
        method: 'get',
        json: true
      })
    }));

    responses.forEach(resp =>
      expect(resp.body.confirmations0.satoshis).to.be.above(1)
    )
  });


});
