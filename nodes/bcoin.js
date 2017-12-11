const Promise = require('bluebird'),
  _ = require('lodash'),
  ipc = require('node-ipc'),
  config = require('../config');

module.exports = function (RED) {
  function ExtractCall (redConfig) {
    RED.nodes.createNode(this, redConfig);
    let node = this;
    this.on('input', async function (msg) {

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

      let method = redConfig.mode === '1' ? _.get(msg, 'payload.method', '') : redConfig.method;
      let params = redConfig.mode === '1' ? _.get(msg, 'payload.params', []) : redConfig.params;

      await new Promise((res, rej) => {
        ipcInstance.connectTo(config.node.ipcName, () => {
          ipcInstance.of[config.node.ipcName].on('connect', res);
          ipcInstance.of[config.node.ipcName].on('error', rej);
        });
      });

      try {
        msg.payload = await new Promise((res, rej) => {
          ipcInstance.of[config.node.ipcName].on('message', data => data.error ? rej(data.error) : res(data.result));
          ipcInstance.of[config.node.ipcName].emit('message', JSON.stringify({
              method: method,
              params: params
            })
          );
        });

        node.send(msg);
      } catch (err) {
        this.error(JSON.stringify(err), msg);
      }
    });
  }

  RED.nodes.registerType('bcoin', ExtractCall);
};
