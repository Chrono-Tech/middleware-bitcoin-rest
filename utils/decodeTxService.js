const ipc = require('node-ipc'),
  config = require('../config');

/**
 * @service
 * @description get balances for each account
 * @param txHex - raw transaction
 * @returns {Promise.<[{balance, account}]>}
 */

module.exports = async txHex => {



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



  await new Promise((res, rej) => {
    ipcInstance.connectTo(config.bitcoin.ipcName, () => {
      ipcInstance.of[config.bitcoin.ipcName].on('connect', res);
      ipcInstance.of[config.bitcoin.ipcName].on('error', rej);
    });
  });



  let tx = await new Promise((res, rej) => {
    ipcInstance.of[config.bitcoin.ipcName].on('message', data => data.error ? rej(data.error) : res(data.result));
    ipcInstance.of[config.bitcoin.ipcName].emit('message', JSON.stringify({
        method: 'decoderawtransaction',
        params: [txHex]
      })
    );
  });

  ipcInstance.disconnect(config.bitcoin.ipcName);

  return tx;

};
