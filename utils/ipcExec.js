/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

const Promise = require('bluebird'),
  uniqid = require('uniqid'),
  ipc = require('node-ipc');

module.exports = async (config, method, params) => {

  const ipcInstance = new ipc.IPC;

  Object.assign(ipcInstance.config, {
    id: uniqid(),
    socketRoot: config.node.ipcPath,
    retry: 1500,
    sync: true,
    silent: true,
    unlink: true,
    maxRetries: 3
  });

  await new Promise((res, rej) => {
    ipcInstance.connectTo(config.node.ipcName, () => {
      ipcInstance.of[config.node.ipcName].on('connect', res);
      ipcInstance.of[config.node.ipcName].on('disconnect', ()=>rej(new Error('CONNECTION ERROR')));
    });
  });

  let response = await new Promise((res, rej) => {
    ipcInstance.of[config.node.ipcName].on('message', data => data.error ? rej(data.error) : res(data.result));
    ipcInstance.of[config.node.ipcName].emit('message', JSON.stringify({method: method, params: params, id: uniqid()})
    );
  });

  ipcInstance.disconnect(config.node.ipcName);

  return response;
};
