'use strict';

module.exports.id = '1.01';

/**
 * @description address flow
 * @param done
 */

module.exports.up = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.insert({
    'meta' : {},
    'type' : 'flows',
    'path' : '2c9dd332.05334c',
    'body' : [
      {
        'id' : '5a35929d.0a716c',
        'type' : 'http in',
        'z' : '2c9dd332.05334c',
        'name' : 'create addr',
        'url' : '/addr',
        'method' : 'post',
        'upload' : false,
        'swaggerDoc' : '',
        'x' : 150,
        'y' : 180,
        'wires' : [
          [
            'f13a8f73.5b9e1',
            '808b0edf.80f64',
            'b53dd569.a5f088'
          ]
        ]
      },
      {
        'id' : 'e4822e75.693fd',
        'type' : 'http response',
        'z' : '2c9dd332.05334c',
        'name' : '',
        'statusCode' : '',
        'x' : 1493,
        'y' : 180,
        'wires' : []
      },
      {
        'id' : '27b27b8e.9827a4',
        'type' : 'mongo',
        'z' : '2c9dd332.05334c',
        'model' : 'EthAccount',
        'request' : '{}',
        'name' : 'mongo create addr',
        'mode' : '1',
        'requestType' : '1',
        'x' : 1050,
        'y' : 180,
        'wires' : [
          [
            '8ab75856.970bb8'
          ]
        ]
      },
      {
        'id' : '8ab75856.970bb8',
        'type' : 'function',
        'z' : '2c9dd332.05334c',
        'name' : 'transform output',
        'func' : '\nlet factories = global.get("factories"); \n\nif(msg.payload.error){\n    msg.payload = msg.payload.error.code === 11000 ? \n    factories.messages.address.existAddress :\n    factories.messages.generic.fail;\n    return msg;\n}\n    \n    \nmsg.payload = factories.messages.generic.success;\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 1257,
        'y' : 181,
        'wires' : [
          [
            'e4822e75.693fd'
          ]
        ]
      },
      {
        'id' : '6d052eef.a0912',
        'type' : 'function',
        'z' : '2c9dd332.05334c',
        'name' : 'transform params',
        'func' : '\nconst _ = global.get(\'_\');\n\nlet address = msg.payload[0].address;\nlet height = msg.payload[1];\nlet txs = msg.payload[2];\n\n\nlet countPositive = (txs, address) => {\n  return _.chain(txs)\n    .map(tx => tx.outputs)\n    .flattenDeep()\n    .filter(output => output.address === address)\n    .map(output => output.value)\n    .sum()\n    .value();\n};\n\nlet countNegative = (txs, address) => {\n  return _.chain(txs)\n    .map(tx => tx.inputs)\n    .flattenDeep()\n    .filter(input => _.get(input, \'coin.address\') === address)\n    .map(input => input.coin.value)\n    .sum()\n    .value();\n};\n    \n  let balances = {\n    confirmations0: _.chain()\n      .thru(() => {\n        return countPositive(txs, address) - countNegative(txs, address);\n      })\n      .defaultTo(0)\n      .value(),\n    confirmations3: _.chain()\n      .thru(() => {\n        let filteredTxs = _.filter(txs, tx => tx.height > 0 && (height - (tx.height - 1)) > 2);\n        return countPositive(filteredTxs, address) - countNegative(filteredTxs, address);\n      })\n      .defaultTo(0)\n      .value(),\n    confirmations6: _.chain()\n      .thru(() => {\n        let filteredTxs = _.filter(txs, tx => tx.height > 0 && (height - (tx.height - 1)) > 5);\n        return countPositive(filteredTxs, address) - countNegative(filteredTxs, address);\n      })\n      .defaultTo(0)\n      .value()\n  };    \n\n\nmsg.payload = {\n    model: \'BitcoinAccount\', \n    request: {\n       address: address,\n       balances: balances\n   }\n};\n\n\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 793,
        'y' : 180,
        'wires' : [
          [
            '27b27b8e.9827a4'
          ]
        ]
      },
      {
        'id' : '65927d71.4e8c44',
        'type' : 'http in',
        'z' : '2c9dd332.05334c',
        'name' : 'remove addr',
        'url' : '/addr',
        'method' : 'delete',
        'upload' : false,
        'swaggerDoc' : '',
        'x' : 150,
        'y' : 340,
        'wires' : [
          [
            '316484c0.63001c'
          ]
        ]
      },
      {
        'id' : 'd0426981.27e8a8',
        'type' : 'http response',
        'z' : '2c9dd332.05334c',
        'name' : '',
        'statusCode' : '',
        'x' : 1050,
        'y' : 340,
        'wires' : []
      },
      {
        'id' : '7c68e0a0.c140d',
        'type' : 'mongo',
        'z' : '2c9dd332.05334c',
        'model' : 'EthAccount',
        'request' : '{}',
        'name' : 'mongo',
        'mode' : '1',
        'requestType' : '3',
        'x' : 610,
        'y' : 340,
        'wires' : [
          [
            'cdd0bdcd.24b59'
          ]
        ]
      },
      {
        'id' : 'cdd0bdcd.24b59',
        'type' : 'function',
        'z' : '2c9dd332.05334c',
        'name' : 'transform output',
        'func' : '\nlet factories = global.get("factories"); \n\nif(msg.payload.error){\n    msg.payload = factories.messages.generic.fail;\n    return msg;\n}\n    \n    \nmsg.payload = factories.messages.generic.success;\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 820,
        'y' : 340,
        'wires' : [
          [
            'd0426981.27e8a8'
          ]
        ]
      },
      {
        'id' : '316484c0.63001c',
        'type' : 'function',
        'z' : '2c9dd332.05334c',
        'name' : 'transform params',
        'func' : '\nmsg.payload = {\n    model: \'BitcoinAccount\', \n    request: {\n       address: msg.payload.address\n   }\n};\n\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 350,
        'y' : 340,
        'wires' : [
          [
            '7c68e0a0.c140d'
          ]
        ]
      },
      {
        'id' : '468de3dc.eb162c',
        'type' : 'http in',
        'z' : '2c9dd332.05334c',
        'name' : 'balance',
        'url' : '/addr/:addr/balance',
        'method' : 'get',
        'upload' : false,
        'swaggerDoc' : '',
        'x' : 130,
        'y' : 580,
        'wires' : [
          [
            '6731d0f7.68fb4'
          ]
        ]
      },
      {
        'id' : '6731d0f7.68fb4',
        'type' : 'function',
        'z' : '2c9dd332.05334c',
        'name' : 'transform params',
        'func' : '\nmsg.payload = {\n    model: \'BitcoinAccount\', \n    request: {\n       address: msg.req.params.addr\n   }\n};\n\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 332.500003814698,
        'y' : 579.99999809265,
        'wires' : [
          [
            'a66b89d5.08b868'
          ]
        ]
      },
      {
        'id' : 'a66b89d5.08b868',
        'type' : 'mongo',
        'z' : '2c9dd332.05334c',
        'model' : 'EthAccount',
        'request' : '{}',
        'name' : 'mongo',
        'mode' : '1',
        'requestType' : '0',
        'x' : 522.500003814698,
        'y' : 581.24999904632,
        'wires' : [
          [
            '36a27ede.06cd52'
          ]
        ]
      },
      {
        'id' : '36a27ede.06cd52',
        'type' : 'function',
        'z' : '2c9dd332.05334c',
        'name' : 'transform output',
        'func' : '\nconst _ = global.get(\'_\');\n\nlet account = msg.payload[0];\n\n\nmsg.payload = {\n    confirmations0: {\n      satoshis: _.get(account, \'balances.confirmations0\', 0),\n      amount: _.get(account, \'balances.confirmations0\', 0) / 100000000\n    },\n    confirmations3: {\n      satoshis: _.get(account, \'balances.confirmations3\', 0),\n      amount: _.get(account, \'balances.confirmations3\', 0) / 100000000\n    },\n    confirmations6: {\n      satoshis: _.get(account, \'balances.confirmations6\', 0),\n      amount: _.get(account, \'balances.confirmations6\', 0) / 100000000\n    },\n  };\n\n\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 716.250007629395,
        'y' : 581.24999904632,
        'wires' : [
          [
            '6e227f25.b210e'
          ]
        ]
      },
      {
        'id' : '6e227f25.b210e',
        'type' : 'http response',
        'z' : '2c9dd332.05334c',
        'name' : '',
        'statusCode' : '',
        'x' : 951.250007629395,
        'y' : 579.99999904632,
        'wires' : []
      },
      {
        'id' : 'e859d127.685df',
        'type' : 'catch',
        'z' : '2c9dd332.05334c',
        'name' : '',
        'scope' : null,
        'x' : 200,
        'y' : 1060,
        'wires' : [
          [
            'd47923c.db3aae'
          ]
        ]
      },
      {
        'id' : '2e2f80ee.29994',
        'type' : 'http response',
        'z' : '2c9dd332.05334c',
        'name' : '',
        'statusCode' : '',
        'x' : 657,
        'y' : 1061,
        'wires' : []
      },
      {
        'id' : 'd47923c.db3aae',
        'type' : 'function',
        'z' : '2c9dd332.05334c',
        'name' : 'transform',
        'func' : '\nlet factories = global.get("factories"); \nlet error = msg.error.message;\ntry {\n    error = JSON.parse(error);\n}catch(e){}\n\nmsg.payload = error && error.code === 11000 ? \nfactories.messages.address.existAddress :\nfactories.messages.generic.fail;\n   \nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 441,
        'y' : 1060,
        'wires' : [
          [
            '2e2f80ee.29994',
            'dee6708f.9e557'
          ]
        ]
      },
      {
        'id' : 'dee6708f.9e557',
        'type' : 'debug',
        'z' : '2c9dd332.05334c',
        'name' : '',
        'active' : true,
        'console' : 'false',
        'complete' : 'false',
        'x' : 547,
        'y' : 958,
        'wires' : []
      },
      {
        'id' : '1a276478.09024c',
        'type' : 'bcoin',
        'z' : '2c9dd332.05334c',
        'mode' : '1',
        'method' : '',
        'name' : 'bcoin',
        'x' : 430,
        'y' : 260,
        'wires' : [
          [
            '808b0edf.80f64'
          ]
        ]
      },
      {
        'id' : 'f13a8f73.5b9e1',
        'type' : 'function',
        'z' : '2c9dd332.05334c',
        'name' : '',
        'func' : '\nconst _ = global.get(\'_\');\n\n\nmsg.payload = {\n    method: \'gettxbyaddress\', \n    params: [msg.payload.address]\n};\n\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 287.076400756836,
        'y' : 260.895851135254,
        'wires' : [
          [
            '1a276478.09024c'
          ]
        ]
      },
      {
        'id' : '808b0edf.80f64',
        'type' : 'join',
        'z' : '2c9dd332.05334c',
        'name' : '',
        'mode' : 'custom',
        'build' : 'array',
        'property' : 'payload',
        'propertyType' : 'msg',
        'key' : 'topic',
        'joiner' : '\\n',
        'joinerType' : 'str',
        'accumulate' : false,
        'timeout' : '',
        'count' : '3',
        'x' : 610,
        'y' : 180,
        'wires' : [
          [
            '6d052eef.a0912'
          ]
        ]
      },
      {
        'id' : '575dc986.761ea8',
        'type' : 'bcoin',
        'z' : '2c9dd332.05334c',
        'mode' : '1',
        'method' : '',
        'params' : [],
        'name' : 'bcoin',
        'x' : 450,
        'y' : 80,
        'wires' : [
          [
            '808b0edf.80f64'
          ]
        ]
      },
      {
        'id' : 'b53dd569.a5f088',
        'type' : 'function',
        'z' : '2c9dd332.05334c',
        'name' : '',
        'func' : '\n\nmsg.payload = {\n    method: \'getblockcount\', \n    params: []\n};\n\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 307.076400756836,
        'y' : 80.8958511352539,
        'wires' : [
          [
            '575dc986.761ea8'
          ]
        ]
      },
      {
        'id' : '4e47577b.ea57f8',
        'type' : 'http response',
        'z' : '2c9dd332.05334c',
        'name' : '',
        'statusCode' : '',
        'x' : 1010,
        'y' : 800,
        'wires' : []
      },
      {
        'id' : '375e54b9.33dc5c',
        'type' : 'http in',
        'z' : '2c9dd332.05334c',
        'name' : 'utxo',
        'url' : '/addr/:addr/utxo',
        'method' : 'get',
        'upload' : false,
        'swaggerDoc' : '',
        'x' : 130,
        'y' : 800,
        'wires' : [
          [
            '98d72b9a.7999f8',
            'c88642a.faeddc'
          ]
        ]
      },
      {
        'id' : '98d72b9a.7999f8',
        'type' : 'function',
        'z' : '2c9dd332.05334c',
        'name' : 'transform params',
        'func' : 'msg.payload ={\n    method: \'getblockcount\',\n    params: []\n}\n\n\n\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 310,
        'y' : 740,
        'wires' : [
          [
            'b960e6b9.e1c2f8'
          ]
        ]
      },
      {
        'id' : 'b960e6b9.e1c2f8',
        'type' : 'bcoin',
        'z' : '2c9dd332.05334c',
        'mode' : '1',
        'method' : '',
        'name' : 'bcoin',
        'x' : 530,
        'y' : 740,
        'wires' : [
          [
            '4945e333.41fc8c'
          ]
        ]
      },
      {
        'id' : 'c88642a.faeddc',
        'type' : 'function',
        'z' : '2c9dd332.05334c',
        'name' : 'transform params',
        'func' : 'msg.payload ={\n    method: \'getcoinsbyaddress\',\n    params: [msg.req.params.addr]\n}\n\n\n\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 310,
        'y' : 860,
        'wires' : [
          [
            'e35ee454.485958'
          ]
        ]
      },
      {
        'id' : 'e35ee454.485958',
        'type' : 'bcoin',
        'z' : '2c9dd332.05334c',
        'mode' : '1',
        'method' : '',
        'name' : 'bcoin',
        'x' : 530,
        'y' : 860,
        'wires' : [
          [
            '4945e333.41fc8c'
          ]
        ]
      },
      {
        'id' : '4945e333.41fc8c',
        'type' : 'join',
        'z' : '2c9dd332.05334c',
        'name' : '',
        'mode' : 'custom',
        'build' : 'array',
        'property' : 'payload',
        'propertyType' : 'msg',
        'key' : 'topic',
        'joiner' : '\\n',
        'joinerType' : 'str',
        'accumulate' : false,
        'timeout' : '',
        'count' : '2',
        'x' : 670,
        'y' : 800,
        'wires' : [
          [
            '2897ae84.380082'
          ]
        ]
      },
      {
        'id' : '2897ae84.380082',
        'type' : 'function',
        'z' : '2c9dd332.05334c',
        'name' : '',
        'func' : 'const _ = global.get(\'_\');\n\nlet height = msg.payload[0];\nlet rawCoins = msg.payload[1];\n\n\n\n  msg.payload =  _.chain(rawCoins)\n    .filter(c => c.height > -1)\n    .map(rawCoin => {\n      return ({\n        address: rawCoin.address,\n        txid: rawCoin.hash,\n        scriptPubKey: rawCoin.script,\n        amount: rawCoin.value / Math.pow(10, 8),\n        satoshis: rawCoin.value,\n        height: rawCoin.height,\n        vout: rawCoin.index,\n        confirmations: height - rawCoin.height + 1\n      });\n    })\n    .orderBy(\'height\', \'desc\')\n    .value();\n\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 830,
        'y' : 800,
        'wires' : [
          [
            '4e47577b.ea57f8'
          ]
        ]
      }
    ]
  }, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.remove({
    'type': 'flows',
    'path': '2c9dd332.05334c'
  }, done);
  done();
};
