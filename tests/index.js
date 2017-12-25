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
  _ = require('lodash'),
  Promise = require('bluebird'),
  request = Promise.promisify(require('request')),
  Coin = require('bcoin/lib/primitives/coin'),
  scope = {},
  mongoose = require('mongoose');

mongoose.Promise = Promise;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('core/rest', function () {

  before(async () => {

    ctx.network = Network.get('regtest');

    let keyPair = bcoin.hd.generate(ctx.network);
    let keyPair2 = bcoin.hd.generate(ctx.network);
    let keyPair3 = bcoin.hd.generate(ctx.network);
    let keyPair4 = bcoin.hd.generate(ctx.network);

    ctx.accounts.push(keyPair, keyPair2, keyPair3, keyPair4);

    mongoose.connect(config.mongo.accounts.uri, {useMongoClient: true});
  });

  after(() => {
    return mongoose.disconnect();
  });

  it('remove registered addresses from mongodb', async () => {

    let keyring = new bcoin.keyring(ctx.accounts[0].privateKey, ctx.network);
    let keyring2 = new bcoin.keyring(ctx.accounts[1].privateKey, ctx.network);
    let keyring3 = new bcoin.keyring(ctx.accounts[2].privateKey, ctx.network);
    let keyring4 = new bcoin.keyring(ctx.accounts[3].privateKey, ctx.network);

    return await accountModel.remove({
      address: {
        $in: [keyring.getAddress().toString(),
          keyring2.getAddress().toString(),
          keyring3.getAddress().toString(),
          keyring4.getAddress().toString()]
      }
    })
  });

  it('generate some coins for accountA', async () => {
    scope.height = await ipcExec('getblockcount', []);
    let keyring = new bcoin.keyring(ctx.accounts[0].privateKey, ctx.network);
    return await ipcExec('generatetoaddress', [50, keyring.getAddress().toString()])
  });

  it('unlock coins for account A by generating some coins for accountD', async () => {
    let keyring = new bcoin.keyring(ctx.accounts[3].privateKey, ctx.network);
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

  it('send coins to accountB and accountC', async () => {

    let keyring = new bcoin.keyring(ctx.accounts[0].privateKey, ctx.network);
    let keyring2 = new bcoin.keyring(ctx.accounts[1].privateKey, ctx.network);
    let keyring3 = new bcoin.keyring(ctx.accounts[2].privateKey, ctx.network);
    let coins = await ipcExec('getcoinsbyaddress', [keyring.getAddress().toString()]);
    let height = await ipcExec('getblockcount', []);

    let inputCoins = _.chain(coins)
      .transform((result, coin) => {
        if (height - coin.height < 6)
          return;

        result.coins.push(Coin.fromJSON(coin));
        result.amount += coin.value;
      }, {amount: 0, coins: []})
      .value();

    const mtx = new bcoin.mtx();

    mtx.addOutput({
      address: keyring2.getAddress(),
      value: Math.pow(10, 8)
    });

    mtx.addOutput({
      address: keyring3.getAddress(),
      value: Math.pow(10, 8) * 3
    });

    await mtx.fund(inputCoins.coins, {
      rate: 10000,
      changeAddress: keyring.getAddress()
    });

    mtx.sign(keyring);
    const tx = mtx.toTX();
    scope.mtx = mtx;

    let response = await request({
      url: `http://${config.rest.domain}:${config.rest.port}/tx/send`,
      method: 'post',
      json: {
        tx: tx.toRaw().toString('hex')
      }
    });

    expect(response.body).to.include.any.keys('hash', 'fee');

  });

  it('generate 1 block', async () => {
    let keyring = new bcoin.keyring(ctx.accounts[3].privateKey, ctx.network);
    return await ipcExec('generatetoaddress', [1, keyring.getAddress().toString()])
  });

  it('validate potential balance changes for accounts', async () => {
    await Promise.delay(60000);
    let keyring = new bcoin.keyring(ctx.accounts[0].privateKey, ctx.network);
    let keyring2 = new bcoin.keyring(ctx.accounts[1].privateKey, ctx.network);
    let keyring3 = new bcoin.keyring(ctx.accounts[2].privateKey, ctx.network);

    let accountA = await accountModel.findOne({address: keyring.getAddress().toString()});
    let accountB = await accountModel.findOne({address: keyring2.getAddress().toString()});
    let accountC = await accountModel.findOne({address: keyring3.getAddress().toString()});

    let diffA = _.get(accountA, 'balances.confirmations6', 0) - _.get(accountA, 'balances.confirmations0', 0);
    let diffB = _.get(accountB, 'balances.confirmations0', 0) - _.get(accountB, 'balances.confirmations6', 0);
    let diffC = _.get(accountC, 'balances.confirmations0', 0) - _.get(accountC, 'balances.confirmations6', 0);

    scope.balanceA0 = _.get(accountA, 'balances.confirmations0', 0);
    scope.balanceB0 = _.get(accountB, 'balances.confirmations0', 0);
    scope.balanceC0 = _.get(accountC, 'balances.confirmations0', 0);

    expect(diffB + diffC + scope.mtx.getFee()).to.equal(diffA);

  });

});
