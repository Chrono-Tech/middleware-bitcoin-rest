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



  let tx = await new Promise((res, rej) => {
    ipcInstance.of[config.node.ipcName].on('message', data => data.error ? rej(data.error) : res(data.result));
    ipcInstance.of[config.node.ipcName].emit('message', JSON.stringify({
      method: 'decoderawtransaction',
      params: [txHex]
    })
    );
  });

  ipcInstance.disconnect(config.node.ipcName);

  return tx;

};
