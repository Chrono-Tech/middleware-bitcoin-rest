/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */

const models = require('../../models'),
  config = require('../config'),
  request = require('request-promise'),
  expect = require('chai').expect,
  url = config.dev.url;

const generateAddress  = (name) => name.concat('a'.repeat(36-name.length))

module.exports = () => {

  before (async () => {
    await models.profileModel.remove({});
    await models.accountModel.remove({});
    await models.txModel.remove({});
  });


  it('GET /addr/:addr/balance without auth headers - error', async () => {
    const address = generateAddress('test-address7');

    const response = await request(`${url}/addr/${address}/balance`, {
      method: 'GET',
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(400);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });

  it('GET /addr/:addr/balance with not right auth headers - error', async () => {
    const address = generateAddress('test-address7');

    const response = await request(`${url}/addr/${address}/balance`, {
      method: 'GET',
      headers: {'Authorization': 'Bearer gippo'},
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(401);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });



  it('GET /tx/:hash without auth headers - error', async () => {
    const hash = generateAddress('test');
    await models.txModel.findOneAndUpdate({'_id': hash}, {
      index: 3,
      timestamp: 6,
      blockNumber: 7
    }, {upsert: true});
    await models.coinModel.findOneAndUpdate({'_id': 'third'}, {
      outputBlock: 7,
      outputTxIndex: 3,
      address: generateAddress('asasd')
    }, {upsert: true});

    const response = await request(`${url}/tx/${hash}`, {
      method: 'GET',
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(400);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });

  it('GET /tx/:hash with not right auth headers - error', async () => {
    const hash = generateAddress('test');

    const response = await request(`${url}/tx/${hash}`, {
      method: 'GET',
      headers: {'Authorization': 'Bearer gippo'},
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(401);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });


  it('GET /tx/:addr/history without auth headers - error', async () => {
    const address = generateAddress('addr');
    await models.accountModel.findOneAndUpdate({address}, {address}, {upsert: true});

    await models.txModel.findOneAndUpdate({'_id': 11}, {
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
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(400);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });

  it('GET /tx/:addr/history with not right auth headers - error', async () => {
    const address = generateAddress('addr');

    const response = await request(`${url}/tx/${address}/history`, {
      method: 'GET',
      headers: {'Authorization': 'Bearer gippo'},
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(401);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });

  it('GET /addr/:addr/utxo without auth headers - error', async () => {
    const address = generateAddress('addr');
    await models.accountModel.findOneAndUpdate({address}, {address}, {upsert: true});

    const response = await request(`${url}/addr/${address}/utxo`, {
      method: 'GET',
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(400);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });

  it('GET /addr/:addr/utxo with not right auth headers - error', async () => {
    const address = generateAddress('addr');

    const response = await request(`${url}/addr/${address}/utxo`, {
      method: 'GET',
      headers: {'Authorization': 'Bearer gippo'},
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(401);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });

  it('GET /blocks/height without auth headers - error', async () => {
    const address = generateAddress('addr');
    await models.accountModel.findOneAndUpdate({address}, {address}, {upsert: true});

    const response = await request(`${url}/blocks/height`, {
      method: 'GET',
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(400);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });

  it('GET /blocks/height with not right auth headers - error', async () => {
    const address = generateAddress('addr');

    const response = await request(`${url}/blocks/height`, {
      method: 'GET',
      headers: {'Authorization': 'Bearer gippo'},
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(401);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });


  it('GET /blocks/last/hash without auth headers - error', async () => {
    const address = generateAddress('addr');
    await models.accountModel.findOneAndUpdate({address}, {address}, {upsert: true});

    const response = await request(`${url}/blocks/last/hash`, {
      method: 'GET',
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(400);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });

  it('GET /blocks/last/hash with not right auth headers - error', async () => {
    const address = generateAddress('addr');

    const response = await request(`${url}/blocks/last/hash`, {
      method: 'GET',
      headers: {'Authorization': 'Bearer gippo'},
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(401);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });

  it('GET /blocks/info/:hashOrNumber without auth headers - error', async () => {
    const address = generateAddress('addr');
    await models.accountModel.findOneAndUpdate({address}, {address}, {upsert: true});

    const response = await request(`${url}/blocks/info/223`, {
      method: 'GET',
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(400);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });

  it('GET /blocks/info/:hashOrNumber with not right auth headers - error', async () => {
    const address = generateAddress('addr');

    const response = await request(`${url}/blocks/info/223`, {
      method: 'GET',
      headers: {'Authorization': 'Bearer gippo'},
      json: true
    }).catch(e => e);
    expect(response.statusCode).to.equal(401);
    expect(response.error).to.deep.equal({code: 401, message: 'fail authentication'});
  });





};
