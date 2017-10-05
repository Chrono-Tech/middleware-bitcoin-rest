const Promise = require('bluebird'),
  ipc = require('node-ipc'),
  Coin = require('bcoin/lib/primitives/coin'),
  Network = require('bcoin/lib/protocol/network'),
  config = require('../config'),
  _ = require('lodash');

/**
 * @service
 * @description get utxos for a specified address
 * @param address - registered address
 * @returns {Promise.<[{address: *,
 *     txid: *,
 *     scriptPubKey: *,
 *     amount: *,
 *     satoshis: *,
 *     height: *,
 *     confirmations: *}]>}
 */


module.exports = async address => {

  const ipcInstance = new ipc.IPC;

  Object.assign(ipcInstance.config, {
    id: Date.now(),
    socketRoot: config.bitcoin.ipcPath,
    retry: 1500,
    sync: true,
    silent: true,
    unlink: false,
    maxRetries: 3
  });

  let network = Network.get(config.bitcoin.network);

  await new Promise((res, rej) => {
    ipcInstance.connectTo(config.bitcoin.ipcName, () => {
      ipcInstance.of[config.bitcoin.ipcName].on('connect', res);
      ipcInstance.of[config.bitcoin.ipcName].on('error', rej);
    });
  });



  let rawCoins = await new Promise((res, rej) => {
    ipcInstance.of[config.bitcoin.ipcName].on('message', data => data.error ? rej(data.error) : res(data.result));
    ipcInstance.of[config.bitcoin.ipcName].emit('message', JSON.stringify({
      method: 'getcoinsbyaddress',
      params: [address]
    })
    );
  });

  let height = await new Promise((res, rej) => {
    ipcInstance.of[config.bitcoin.ipcName].on('message', data => data.error ? rej(data.error) : res(data.result));
    ipcInstance.of[config.bitcoin.ipcName].emit('message', JSON.stringify({
      method: 'getblockcount',
      params: []
    })
    );
  });

  ipcInstance.disconnect(config.bitcoin.ipcName);

  return _.chain(rawCoins)
    .filter(c => c.height > -1)
    .map(rawCoin => {
      let coin = Coin.fromJSON(rawCoin).getJSON(network);
      return ({
        address: coin.address,
        txid: coin.hash,
        scriptPubKey: coin.script,
        amount: coin.value / 100000000,
        satoshis: coin.value,
        height: coin.height,
        confirmations: height - coin.height
      });
    })
    .value();
};
