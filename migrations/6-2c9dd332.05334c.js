module.exports.id = '6.2c9dd332.05334c';

/**
 * @description flow 2c9dd332.05334c update
 * @param done
 */


module.exports.up = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.update({'path': '2c9dd332.05334c', 'type': 'flows'}, {
    $set: {
      'path': '2c9dd332.05334c',
      'body': [{
        'id': '5a35929d.0a716c',
        'type': 'http in',
        'z': '2c9dd332.05334c',
        'name': 'create addr',
        'url': '/addr',
        'method': 'post',
        'upload': false,
        'swaggerDoc': '',
        'x': 250,
        'y': 120,
        'wires': [['11fd83b0.8531dc']]
      }, {
        'id': 'e4822e75.693fd',
        'type': 'http response',
        'z': '2c9dd332.05334c',
        'name': '',
        'statusCode': '',
        'x': 1030,
        'y': 120,
        'wires': []
      }, {
        'id': '65927d71.4e8c44',
        'type': 'http in',
        'z': '2c9dd332.05334c',
        'name': 'remove addr',
        'url': '/addr',
        'method': 'delete',
        'upload': false,
        'swaggerDoc': '',
        'x': 250,
        'y': 340,
        'wires': [['316484c0.63001c']]
      }, {
        'id': 'd0426981.27e8a8',
        'type': 'http response',
        'z': '2c9dd332.05334c',
        'name': '',
        'statusCode': '',
        'x': 1190,
        'y': 340,
        'wires': []
      }, {
        'id': '7c68e0a0.c140d',
        'type': 'mongo',
        'z': '2c9dd332.05334c',
        'model': 'EthAccount',
        'request': '{}',
        'name': 'mongo',
        'mode': '1',
        'requestType': '3',
        'dbAlias': 'accounts',
        'x': 650,
        'y': 340,
        'wires': [['d7c0637b.46c32']]
      }, {
        'id': 'cdd0bdcd.24b59',
        'type': 'function',
        'z': '2c9dd332.05334c',
        'name': 'transform output',
        'func': '\nlet factories = global.get("factories"); \n\nif(msg.payload.error){\n    msg.payload = factories.messages.generic.fail;\n    return msg;\n}\n    \n    \nmsg.payload = factories.messages.generic.success;\nreturn msg;',
        'outputs': 1,
        'noerr': 0,
        'x': 960,
        'y': 340,
        'wires': [['d0426981.27e8a8']]
      }, {
        'id': '316484c0.63001c',
        'type': 'function',
        'z': '2c9dd332.05334c',
        'name': 'transform params',
        'func': 'const prefix = global.get(\'settings.mongo.accountPrefix\');\n\nmsg.address = msg.payload.address;\n\nmsg.payload = {\n    model: `${prefix}Account`, \n    request: {\n       address: msg.payload.address\n   }\n};\n\nreturn msg;',
        'outputs': 1,
        'noerr': 0,
        'x': 450,
        'y': 340,
        'wires': [['7c68e0a0.c140d']]
      }, {
        'id': '468de3dc.eb162c',
        'type': 'http in',
        'z': '2c9dd332.05334c',
        'name': 'balance',
        'url': '/addr/:addr/balance',
        'method': 'get',
        'upload': false,
        'swaggerDoc': '',
        'x': 130,
        'y': 580,
        'wires': [['6731d0f7.68fb4']]
      }, {
        'id': '6731d0f7.68fb4',
        'type': 'function',
        'z': '2c9dd332.05334c',
        'name': 'transform params',
        'func': 'const prefix = global.get(\'settings.mongo.accountPrefix\');\n\n\nmsg.payload = {\n    model: `${prefix}Account`, \n    request: {\n       address: msg.req.params.addr\n   }\n};\n\nreturn msg;',
        'outputs': 1,
        'noerr': 0,
        'x': 330,
        'y': 580,
        'wires': [['a66b89d5.08b868', 'e127f8f8.a63ac8']]
      }, {
        'id': 'a66b89d5.08b868',
        'type': 'mongo',
        'z': '2c9dd332.05334c',
        'model': 'EthAccount',
        'request': '{}',
        'name': 'mongo',
        'mode': '1',
        'requestType': '0',
        'dbAlias': 'accounts',
        'x': 522.500003814698,
        'y': 581.24999904632,
        'wires': [['36a27ede.06cd52', 'e127f8f8.a63ac8']]
      }, {
        'id': '36a27ede.06cd52',
        'type': 'function',
        'z': '2c9dd332.05334c',
        'name': 'transform output',
        'func': '\nconst _ = global.get(\'_\');\n\nlet account = msg.payload[0];\n\n\nmsg.payload = {\n    confirmations0: {\n      satoshis: _.get(account, \'balances.confirmations0\', 0),\n      amount: _.get(account, \'balances.confirmations0\', 0) / 100000000\n    },\n    confirmations3: {\n      satoshis: _.get(account, \'balances.confirmations3\', 0),\n      amount: _.get(account, \'balances.confirmations3\', 0) / 100000000\n    },\n    confirmations6: {\n      satoshis: _.get(account, \'balances.confirmations6\', 0),\n      amount: _.get(account, \'balances.confirmations6\', 0) / 100000000\n    },\n  };\n\n\nreturn msg;',
        'outputs': 1,
        'noerr': 0,
        'x': 716.250007629395,
        'y': 581.24999904632,
        'wires': [['6e227f25.b210e']]
      }, {
        'id': '6e227f25.b210e',
        'type': 'http response',
        'z': '2c9dd332.05334c',
        'name': '',
        'statusCode': '',
        'x': 951.250007629395,
        'y': 579.99999904632,
        'wires': []
      }, {
        'id': 'e859d127.685df',
        'type': 'catch',
        'z': '2c9dd332.05334c',
        'name': '',
        'scope': null,
        'x': 200,
        'y': 1060,
        'wires': [['d47923c.db3aae', 'dee6708f.9e557']]
      }, {
        'id': '2e2f80ee.29994',
        'type': 'http response',
        'z': '2c9dd332.05334c',
        'name': '',
        'statusCode': '',
        'x': 657,
        'y': 1061,
        'wires': []
      }, {
        'id': 'd47923c.db3aae',
        'type': 'function',
        'z': '2c9dd332.05334c',
        'name': 'transform',
        'func': '\nlet factories = global.get("factories"); \nlet error = msg.error.message;\ntry {\n    error = JSON.parse(error);\n}catch(e){}\n\nmsg.payload = error && error.code === 11000 ? \nfactories.messages.address.existAddress :\n\nmsg.error.message && msg.error.code ?\nmsg.error :\nfactories.messages.generic.fail;\n   \nreturn msg;',
        'outputs': 1,
        'noerr': 0,
        'x': 441,
        'y': 1060,
        'wires': [['2e2f80ee.29994']]
      }, {
        'id': 'dee6708f.9e557',
        'type': 'debug',
        'z': '2c9dd332.05334c',
        'name': '',
        'active': true,
        'console': 'false',
        'complete': 'error',
        'x': 537,
        'y': 958,
        'wires': []
      }, {
        'id': '4e47577b.ea57f8',
        'type': 'http response',
        'z': '2c9dd332.05334c',
        'name': '',
        'statusCode': '',
        'x': 1050,
        'y': 800,
        'wires': []
      }, {
        'id': '375e54b9.33dc5c',
        'type': 'http in',
        'z': '2c9dd332.05334c',
        'name': 'utxo',
        'url': '/addr/:addr/utxo',
        'method': 'get',
        'upload': false,
        'swaggerDoc': '',
        'x': 130,
        'y': 800,
        'wires': [['2be633a7.9859fc']]
      }, {
        'id': '4945e333.41fc8c',
        'type': 'join',
        'z': '2c9dd332.05334c',
        'name': '',
        'mode': 'auto',
        'build': 'merged',
        'property': 'payload',
        'propertyType': 'msg',
        'key': 'topic',
        'joiner': '\\n',
        'joinerType': 'str',
        'accumulate': false,
        'timeout': '',
        'count': '2',
        'x': 710,
        'y': 800,
        'wires': [['2897ae84.380082']]
      }, {
        'id': '2897ae84.380082',
        'type': 'function',
        'z': '2c9dd332.05334c',
        'name': '',
        'func': 'const _ = global.get(\'_\');\n\nlet height = msg.payload[0];\nlet rawCoins = msg.payload[1];\n\n\n\n  msg.payload =  _.chain(rawCoins)\n    .filter(c => c.height > -1)\n    .map(rawCoin => {\n      return ({\n        address: rawCoin.address,\n        txid: rawCoin.hash,\n        scriptPubKey: rawCoin.script,\n        amount: rawCoin.value / Math.pow(10, 8),\n        satoshis: rawCoin.value,\n        height: rawCoin.height,\n        vout: rawCoin.index,\n        confirmations: height - rawCoin.height + 1\n      });\n    })\n    .orderBy(\'height\', \'desc\')\n    .value();\n\nreturn msg;',
        'outputs': 1,
        'noerr': 0,
        'x': 870,
        'y': 800,
        'wires': [['4e47577b.ea57f8']]
      }, {
        'id': '8346fba1.12d028',
        'type': 'bcoin',
        'z': '2c9dd332.05334c',
        'mode': '1',
        'method': '',
        'params': [],
        'name': 'bcoin',
        'x': 570,
        'y': 800,
        'wires': [['4945e333.41fc8c']]
      }, {
        'id': '2be633a7.9859fc',
        'type': 'function',
        'z': '2c9dd332.05334c',
        'name': '',
        'func': '\nmsg.req.address = msg.payload.address\n\nmsg.payload = [{\n    method: \'getblockcount\', \n    params: []\n}, {\n    method: \'getcoinsbyaddress\',\n    params: [msg.req.params.addr]\n}];\n\nreturn msg;',
        'outputs': 1,
        'noerr': 0,
        'x': 310,
        'y': 800,
        'wires': [['66707387.71cc7c']]
      }, {
        'id': '66707387.71cc7c',
        'type': 'split',
        'z': '2c9dd332.05334c',
        'name': '',
        'splt': '\\n',
        'spltType': 'str',
        'arraySplt': '1',
        'arraySpltType': 'len',
        'stream': false,
        'addname': '',
        'x': 430,
        'y': 800,
        'wires': [['8346fba1.12d028']]
      }, {
        'id': '11fd83b0.8531dc',
        'type': 'async-function',
        'z': '2c9dd332.05334c',
        'name': '',
        'func': 'const _ = global.get(\'_\');\nconst genericMessages = global.get(\'factories\').messages.generic;\nconst rpc = global.get(\'rpc\');\nconst prefix = global.get(\'settings.mongo.accountPrefix\');\n\n\nif (!msg.payload.address) {\n     throw new Error(genericMessages.notEnoughArgs);\n  }\n\n  \n      \n    let rawCoins = await rpc(\'getcoinsbyaddress\', [msg.payload.address]);\n    let height = await rpc(\'getblockcount\', []);\n      \n    let utxos = _.chain(rawCoins)\n    .filter(c => c.height > -1)\n    .map(rawCoin => {\n      return ({\n        address: rawCoin.address,\n        txid: rawCoin.hash,\n        scriptPubKey: rawCoin.script,\n        amount: rawCoin.value / Math.pow(10, 8),\n        satoshis: rawCoin.value,\n        height: rawCoin.height,\n        vout: rawCoin.index,\n        confirmations: height - rawCoin.height + 1\n      });\n    })\n    .orderBy(\'height\', \'desc\')\n    .value();\n    \n    \n    \n      let highestCoin = _.chain(utxos)\n    .sortBy(\'height\')\n    .last()\n    .defaults({\n      confirmations: 0,\n      height: 0\n    })\n    .value();\n    \n    \n    let balances = {\n    confirmations0: _.chain(utxos)\n      .map(coin => coin.satoshis)\n      .sum()\n      .defaultTo(0)\n      .value(),\n    confirmations3: _.chain(utxos)\n      .filter(coin => coin.confirmations >= 3)\n      .map(coin => coin.satoshis)\n      .sum()\n      .defaultTo(0)\n      .value(),\n    confirmations6: _.chain(utxos)\n      .filter(coin => coin.confirmations >= 6)\n      .map(coin => coin.satoshis)\n      .sum()\n      .defaultTo(0)\n      .value()\n    };\n\n    msg.address = msg.payload.address;\n\n    msg.payload = {\n    model: `${prefix}Account`, \n    request: {\n       address: msg.payload.address,\n       lastBlockCheck: highestCoin.confirmations + highestCoin.height - 1,\n       balances: {\n           confirmations0:  _.get(balances, \'confirmations0\', 0),\n           confirmations3: _.get(balances, \'confirmations3\', 0),\n           confirmations6: _.get(balances, \'confirmations6\', 0)\n       }\n   }\n};\n\n\n\n\nreturn msg;',
        'outputs': 1,
        'noerr': 2,
        'x': 410,
        'y': 120,
        'wires': [['352fd4a8.2620ac']]
      }, {
        'id': '352fd4a8.2620ac',
        'type': 'mongo',
        'z': '2c9dd332.05334c',
        'model': 'EthAccount',
        'request': '{}',
        'name': 'mongo',
        'mode': '1',
        'requestType': '1',
        'dbAlias': 'accounts',
        'x': 550,
        'y': 120,
        'wires': [['3c61534d.fb608c']]
      }, {
        'id': '2a6a8ea2.44a9e2',
        'type': 'function',
        'z': '2c9dd332.05334c',
        'name': 'transform output',
        'func': '\nlet factories = global.get("factories"); \n\nif(msg.payload.error){\n    msg.payload = factories.messages.generic.fail;\n    return msg;\n}\n    \n    \nmsg.payload = factories.messages.generic.success;\nreturn msg;',
        'outputs': 1,
        'noerr': 0,
        'x': 860,
        'y': 120,
        'wires': [['e4822e75.693fd']]
      }, {
        'id': 'e127f8f8.a63ac8',
        'type': 'debug',
        'z': '2c9dd332.05334c',
        'name': '',
        'active': true,
        'console': 'false',
        'complete': 'false',
        'x': 677.0764312744141,
        'y': 522.5625381469727,
        'wires': []
      }, {
        'id': 'fb8909f1.457008',
        'type': 'amqp in',
        'z': '2c9dd332.05334c',
        'name': 'post addresses',
        'topic': '${config.rabbit.serviceName}.account.create',
        'iotype': '3',
        'ioname': 'events',
        'noack': '1',
        'durablequeue': '1',
        'durableexchange': '0',
        'server': '',
        'servermode': '1',
        'x': 100,
        'y': 220,
        'wires': [['f0edc237.50ca1']]
      }, {
        'id': 'f0edc237.50ca1',
        'type': 'function',
        'z': '2c9dd332.05334c',
        'name': '',
        'func': '\nmsg.payload = JSON.parse(msg.payload);\n\nreturn msg;',
        'outputs': 1,
        'noerr': 0,
        'x': 270,
        'y': 220,
        'wires': [['11fd83b0.8531dc']]
      }, {
        'id': 'd430cfb9.80173',
        'type': 'amqp out',
        'z': '2c9dd332.05334c',
        'name': '',
        'topic': '${config.rabbit.serviceName}.account.created',
        'iotype': '3',
        'ioname': 'events',
        'server': '',
        'servermode': '1',
        'x': 1010,
        'y': 200,
        'wires': []
      }, {
        'id': '3c61534d.fb608c',
        'type': 'switch',
        'z': '2c9dd332.05334c',
        'name': '',
        'property': 'amqpMessage',
        'propertyType': 'msg',
        'rules': [{'t': 'null'}, {'t': 'nnull'}],
        'checkall': 'true',
        'outputs': 2,
        'x': 690,
        'y': 120,
        'wires': [['2a6a8ea2.44a9e2'], ['fd565cdc.5b9e']]
      }, {
        'id': 'fd565cdc.5b9e',
        'type': 'function',
        'z': '2c9dd332.05334c',
        'name': '',
        'func': '\nif(msg.amqpMessage)\n    msg.amqpMessage.ack();\n\nmsg.payload = JSON.stringify({address: msg.address})\n\nreturn msg;',
        'outputs': 1,
        'noerr': 0,
        'x': 850,
        'y': 200,
        'wires': [['d430cfb9.80173']]
      }, {
        'id': '5e8d6a6f.829244',
        'type': 'amqp in',
        'z': '2c9dd332.05334c',
        'name': 'delete addresses',
        'topic': '${config.rabbit.serviceName}.account.delete',
        'iotype': '3',
        'ioname': 'events',
        'noack': '1',
        'durablequeue': '1',
        'durableexchange': '0',
        'server': '',
        'servermode': '1',
        'x': 80,
        'y': 440,
        'wires': [['c1017ee9.20a23']]
      }, {
        'id': 'c1017ee9.20a23',
        'type': 'function',
        'z': '2c9dd332.05334c',
        'name': '',
        'func': '\nmsg.payload = JSON.parse(msg.payload);\n\nreturn msg;',
        'outputs': 1,
        'noerr': 0,
        'x': 250,
        'y': 440,
        'wires': [['316484c0.63001c']]
      }, {
        'id': 'c1a99120.e1907',
        'type': 'amqp out',
        'z': '2c9dd332.05334c',
        'name': '',
        'topic': '${config.rabbit.serviceName}.account.deleted',
        'iotype': '3',
        'ioname': 'events',
        'server': '',
        'servermode': '1',
        'x': 1050,
        'y': 420,
        'wires': []
      }, {
        'id': '54f1c0e7.3a5a7',
        'type': 'function',
        'z': '2c9dd332.05334c',
        'name': '',
        'func': '\nif(msg.amqpMessage)\n    msg.amqpMessage.ack();\n\nmsg.payload = JSON.stringify({address: msg.address})\n\nreturn msg;',
        'outputs': 1,
        'noerr': 0,
        'x': 910,
        'y': 420,
        'wires': [['c1a99120.e1907']]
      }, {
        'id': 'd7c0637b.46c32',
        'type': 'switch',
        'z': '2c9dd332.05334c',
        'name': '',
        'property': 'amqpMessage',
        'propertyType': 'msg',
        'rules': [{'t': 'null'}, {'t': 'nnull'}],
        'checkall': 'true',
        'outputs': 2,
        'x': 790,
        'y': 340,
        'wires': [['cdd0bdcd.24b59'], ['54f1c0e7.3a5a7']]
      }]
    }
  }, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.remove({'path': '2c9dd332.05334c', 'type': 'flows'}, done);
};
