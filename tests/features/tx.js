/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */

const models = require('../../models'),
  config = require('../config'),
  request = require('request-promise'),
  expect = require('chai').expect,
  url = 'http://localhost:8081';


const generateAddress  = (name) => name.concat('a'.repeat(36-name.length)).toLowerCase()
const getAuthHeaders = () => { return {'Authorization': 'Bearer ' + config.dev.laborx.token}; }

module.exports = (ctx) => {

  before (async () => {
    await models.profileModel.remove({});
    await models.accountModel.remove({});
  });

  beforeEach(async () => {
    await models.txModel.remove({});
    await models.blockModel.remove({});
    await models.coinModel.remove({});
  });

  it('GET /tx/:hash when no tx in db - get null', async () => {
    const response = await request(`${url}/tx/TXHASH`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);
    expect(response).to.deep.equal(null);
  });

  it('GET /tx/:hash with non exist hash - get null', async () => {
    const hash = 'TESTHASH';
    const address = generateAddress('addr');
    await models.txModel.findOneAndUpdate({'_id': hash}, {
      timestamp: 1,
      index: 1,
      blockNumber: 5
    }, {upsert: true});
    await models.coinModel.findOneAndUpdate({'_id': hash}, {
      inputBlock: 5,
      inputIndex: 1,
      address
    }, {upsert: true});

    const response = await request(`${url}/tx/BART`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);
    expect(response).to.deep.equal(null);
  });

  it('GET /tx/:hash with exist hash (in db two txs) - get right tx', async () => {
    const hash = 'TESTHASH2';
    const address = generateAddress('addr');
    const tx = await models.txModel.findOneAndUpdate({'_id': hash}, {
      index: 1,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true, new: true});
  
    await models.txModel.findOneAndUpdate({'_id': 'HASHES'}, {
      index: 2,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});
    await models.blockModel.findOneAndUpdate({'_id': 'HASH'}, {
      number: 5,
    }, {upsert: true})
    await models.coinModel.findOneAndUpdate({'_id': 'first'}, {
      inputBlock: 5,
      inputTxIndex: 1,
      address
    }, {upsert: true});
    await models.coinModel.findOneAndUpdate({'_id': 'second'}, {
      inputBlock: 5,
      inputTxIndex: 2,
      address: generateAddress('addr2')
    }, {upsert: true});

    const response = await request(`${url}/tx/${hash}`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);

    expect(response).to.deep.equal({
      index: 1,
      timestamp: 1,
      blockNumber: 5,
      hash: 'TESTHASH2',
      inputs: [ { address } ],
      outputs: [],
      confirmations: 1
    });
  });



  it('GET /tx/:addr/history when no tx in db - get []', async () => {
    const address = generateAddress('addr');
    const response = await request(`${url}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);
    expect(response).to.deep.equal([]);
  });

  it('GET /tx/:addr/history with non exist address - get []', async () => {
    const address = generateAddress('addr');
    const tx = await models.txModel.findOneAndUpdate({'_id': 'first'}, {
      index: 1,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true, new: true});
  
    await models.coinModel.findOneAndUpdate({'_id': 'second'}, {
      inputBlock: 5,
      inputTxIndex: 1,
      address: generateAddress('addr2')
    }, {upsert: true});

    const response = await request(`${url}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);
    expect(response).to.deep.equal([]);
  });

  it('GET /tx/:addr/history with exist address (in db two him txs and not him) - get right txs', async () => {
    const address = generateAddress('addr');
    const txs = [];
    txs[0] = await models.txModel.findOneAndUpdate({'_id': 'TEST1'}, {
      index: 1,
      timestamp: 1,
      blockNumber: 5
    }, {upsert: true});
    await models.coinModel.findOneAndUpdate({'_id': 'first'}, {
      inputBlock: 5,
      inputTxIndex: 1,
      address
    }, {upsert: true});

    await models.txModel.findOneAndUpdate({'_id': 'HASHES'}, {
      index: 2,
      timestamp: 1,
      blockNumber: 6
    }, {upsert: true});
    await models.coinModel.findOneAndUpdate({'_id': 'second'}, {
      inputBlock: 6,
      inputTxIndex: 2,
      address: generateAddress('addr2')
    }, {upsert: true});
    
    txs[1] = await models.txModel.findOneAndUpdate({'_id': 'TEST2'}, {
      index: 3,
      timestamp: 6,
      blockNumber: 7
    }, {upsert: true});
    await models.coinModel.findOneAndUpdate({'_id': 'third'}, {
      outputBlock: 7,
      outputTxIndex: 3,
      address
    }, {upsert: true});

    const response = await request(`${url}/tx/${address}/history`, {
      method: 'GET',
      json: true,
      headers: getAuthHeaders()
    }).catch(e => e);
    expect(response.length).to.equal(2);
    expect(response).to.deep.equal([
      {
        index: 3,
        timestamp: 6,
        blockNumber: 7,
        hash: 'TEST2',
        inputs: [],
        outputs: [ { address }],
        confirmations: -1

      }, {
        index: 1,
        timestamp: 1,
        blockNumber: 5,
        hash: 'TEST1',
        inputs: [ { address } ],
        outputs: [],
        confirmations: -1
      }
    ])
  });

};
