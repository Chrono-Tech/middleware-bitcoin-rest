/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */

const models = require('../../models'),
  config = require('../config'),
  request = require('request-promise'),
  expect = require('chai').expect,
  Promise = require('bluebird'),
  url = config.dev.url;


const generateAddress  = (name) => name.concat('a'.repeat(36-name.length)).toLowerCase()
const getAuthHeaders = () => { return {'Authorization': 'Bearer ' + config.dev.laborx.token}; }


module.exports = (ctx) => {

  before (async () => {
    await models.profileModel.remove({});
    await models.accountModel.remove({});
    await models.txModel.remove({});
  });

  afterEach(async () => {
    if (ctx.amqp.queue)
      await ctx.amqp.channel.deleteQueue(ctx.amqp.queue.queue);
    await Promise.delay(1000);
  });



  it('POST /addr - response with addr', async () => {
    const address = generateAddress('test');

    const response = await request(url + '/addr', {
      method: 'POST',
      json: {address}
    });
    expect(response.address).to.equal(address);
  });

  it('POST /addr -  rabbitmq message account.create with addr', async () => {
    const address = generateAddress('test1');
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', `${config.rabbit.serviceName}.account.create`);

    await Promise.all([
      (async () => {
        await request(url + '/addr', {
          method: 'POST',
          json: {address}
        });
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr', msg => {
          const content = JSON.parse(msg.content);
          expect(content.address).to.equal(address);
          if (msg.fields.consumerTag)
            ctx.amqp.channel.cancel(msg.fields.consumerTag);
          res();
        }));
      })()
    ]);

  });

  it('POST /addr with exist addr - get response', async () => {
    const address = generateAddress('test');

    const response = await request(url + '/addr', {
      method: 'POST',
      json: {address}
    });
    expect(response.address).to.equal(address);
  });


  it('send message address.created from laborx - get events message account.created after account in mongo', async () => {
    const address = generateAddress('test4');
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr4', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr4', 'events', `${config.rabbit.serviceName}.account.created`);
    await Promise.all([
      (async () => {
        const data = {'bitcoin-address': address};
        await Promise.delay(5000);
        await ctx.amqp.channel.publish('profiles', 'address.created', new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr4',  msg => {
          const content = JSON.parse(msg.content);
          expect(content.address).to.equal(address);
          ctx.amqp.channel.cancel(msg.fields.consumerTag);
          res();
        }));
        const account = await models.accountModel.findOne({address});
        expect(account.address).to.equal(address);
      })()
    ]);
  });

  it('send message address.created from laborx - get internal message user.created after account in mongo', async () => {
    const address = generateAddress('test5');
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr5', 
      {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr5', 'events', 
      `${config.rabbit.serviceName}.account.created`);
    
    await Promise.all([
      (async () => {
        const data = {'bitcoin-address': address};
        await ctx.amqp.channel.publish('profiles', 'address.created', 
          new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr5',  msg => {
          const content = JSON.parse(msg.content);
          expect(content.address).to.equal(address);
          ctx.amqp.channel.cancel(msg.fields.consumerTag);
          res();
        }));
        const account = await models.accountModel.findOne({address});
        expect(account.address).to.equal(address);;
      })()
    ]);
  });

  it('send message address.created from laborx with exist addr - get messages user.created, account.created with account in mongo', async () => {
    const address = generateAddress('test5');
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr6', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr6', 'internal', `${config.rabbit.serviceName}_user.created`);
    
    await ctx.amqp.channel.assertQueue('test_addr7', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr7', 'events', `${config.rabbit.serviceName}.account.created`);
    
    await Promise.all([
      (async () => {
        const data = {'bitcoin-address': address};
        await ctx.amqp.channel.publish('profiles', 'address.created', new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr6', msg => {
          const content = JSON.parse(msg.content);
          expect(content.address).to.equal(address);
          ctx.amqp.channel.cancel(msg.fields.consumerTag);
          res();
        }));
        const account = await models.accountModel.findOne({address});
        expect(account.address).to.equal(address);
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr7', msg => {
          const content = JSON.parse(msg.content);
          expect(content.address).to.equal(address);
          ctx.amqp.channel.cancel(msg.fields.consumerTag);
          res();
        }));

        const account = await models.accountModel.findOne({address});
        expect(account.address).to.equal(address);
      })()
    ]);
  });

  it('send event message account.create  - get events message account.created after account in mongo', async () => {
    const address = generateAddress('test6');
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', `${config.rabbit.serviceName}.account.created`);
    
    await Promise.all([
      (async () => {
        const data = {address};
        await ctx.amqp.channel.publish('events', `${config.rabbit.serviceName}.account.create`, new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr', msg => {
          const content = JSON.parse(msg.content);
          expect(content.address).to.equal(address);
          ctx.amqp.channel.cancel(msg.fields.consumerTag);
          res();
        }));

        const account = await models.accountModel.findOne({address});
        expect(account.address).to.equal(address);
      })()
    ]);
  });

  it('send event message account.create  - get internal message user.created after account in mongo', async () => {
    const address = generateAddress('test7');
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'internal', `${config.rabbit.serviceName}_user.created`);
    
    await Promise.all([
      (async () => {
        const data = {address};
        await ctx.amqp.channel.publish('events', `${config.rabbit.serviceName}.account.create`, new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr', msg => {
          const content = JSON.parse(msg.content);
          expect(content.address).to.equal(address);
          ctx.amqp.channel.cancel(msg.fields.consumerTag);
          res();
        }));

        const account = await models.accountModel.findOne({address});
        expect(account.address).to.equal(address);
      })()
    ]);
  });

  it('send message address.deleted from laborx - get events message account.deleted after account deleted in mongo', async () => {
    const address = generateAddress('test4');
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', `${config.rabbit.serviceName}.account.deleted`);
    
    await Promise.all([
      (async () => {
        const data = {'bitcoin-address': address};
        await ctx.amqp.channel.publish('profiles', 'address.deleted', new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr',  msg => {
          const content = JSON.parse(msg.content);
          expect(content.address).to.equal(address);
          ctx.amqp.channel.cancel(msg.fields.consumerTag);
          res();
        }));

        const account = await models.accountModel.findOne({address});
        expect(account.isActive).to.equal(false);
      })()
    ]);
  });

  it('send message address.deleted from laborx about not exist addr - get account.deleted event', async () => {
    const address = generateAddress('test4');
    
    ctx.amqp.queue = await ctx.amqp.channel.assertQueue('test_addr', {autoDelete: true, durable: false, noAck: true});
    await ctx.amqp.channel.bindQueue('test_addr', 'events', `${config.rabbit.serviceName}.account.deleted`);
   

    await Promise.all([
      (async () => {
        const data = {'bitcoin-address': address};
        await ctx.amqp.channel.publish('profiles', 'address.deleted', new Buffer(JSON.stringify(data)));
      })(),

      (async () => {
        await new Promise(res => ctx.amqp.channel.consume('test_addr',  msg => {
          const content = JSON.parse(msg.content);
          expect(content.length).to.equal(0);
          ctx.amqp.channel.cancel(msg.fields.consumerTag);
          res();
        }));
        const account = await models.accountModel.findOne({address});
        expect(account.isActive).to.equal(false);
      })
    ]);
  });

  it('GET /addr/:addr/balance - and get response with balance', async () => {
    const address = generateAddress('test7');

    const response = await request(`${url}/addr/${address}/balance`, {
      method: 'GET',
      headers: getAuthHeaders(),
      json: true
    });
    expect(response).to.deep.equal({
      confirmations0: { amount: 0, satoshis: 0 },
      confirmations3: { amount: 0, satoshis: 0 },
      confirmations6: { amount: 0, satoshis: 0 } 
    });

  });

  it('GET /addr/:addr/balance - and get response with balance and mosaics', async () => {
    const address = generateAddress('test7');

    await models.accountModel.findOneAndUpdate({address}, {
      balances: {
        confirmations0: 300*100000000,
        confirmations3: 500*100000000,
        confirmations6: 200*100000000
      }
    });


    const response = await request(`${url}/addr/${address}/balance`, {
      method: 'GET',
      headers: getAuthHeaders(),
      json: true
    });
    expect(response).to.deep.equal({
      confirmations0: { satoshis: 30000000000, amount: 300 },
      confirmations3: { satoshis: 50000000000, amount: 500 },
      confirmations6: { satoshis: 20000000000, amount: 200 } 
    });

  });


};
