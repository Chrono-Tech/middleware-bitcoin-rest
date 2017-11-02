const Promise = require('bluebird'),
  ipc = require('node-ipc'),
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
    socketRoot: config.node.ipcPath,
    retry: 1500,
    sync: true,
    silent: true,
    unlink: false,
    maxRetries: 3
  });

  await new Promise((res, rej) => {
    ipcInstance.connectTo(config.node.ipcName, () => {
      ipcInstance.of[config.node.ipcName].on('connect', res);
      ipcInstance.of[config.node.ipcName].on('error', rej);
    });
  });



  let rawCoins = await new Promise((res, rej) => {
    ipcInstance.of[config.node.ipcName].on('message', data => data.error ? rej(data.error) : res(data.result));
    ipcInstance.of[config.node.ipcName].emit('message', JSON.stringify({
      method: 'getcoinsbyaddress',
      params: [address]
    })
    );
  });

  let height = await new Promise((res, rej) => {
    ipcInstance.of[config.node.ipcName].on('message', data => data.error ? rej(data.error) : res(data.result));
    ipcInstance.of[config.node.ipcName].emit('message', JSON.stringify({
      method: 'getblockcount',
      params: []
    })
    );
  });

  ipcInstance.disconnect(config.node.ipcName);

  return _.chain(rawCoins)
    .filter(c => c.height > -1)
    .map(rawCoin => {
      return ({
        address: rawCoin.address,
        txid: rawCoin.hash,
        scriptPubKey: rawCoin.script,
        amount: rawCoin.value / Math.pow(10, 8),
        satoshis: rawCoin.value,
        height: rawCoin.height,
        vout: rawCoin.index,
        confirmations: height - rawCoin.height + 1
      });
    })
    .orderBy('height', 'desc')
    .value();
};
