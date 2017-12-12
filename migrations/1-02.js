'use strict';

module.exports.id = '1.02';

/**
 * @description tx flows
 * @param done
 */

module.exports.up = function (done) {
  let coll = this.db.collection('noderedstorages');
  coll.insert({
    'meta' : {},
    'type' : 'flows',
    'path' : 'e415e43d.f10178',
    'body' : [
      {
        'id' : 'b68ffffb.8e49e',
        'type' : 'catch',
        'z' : 'e415e43d.f10178',
        'name' : '',
        'scope' : null,
        'x' : 260,
        'y' : 520,
        'wires' : [
          [
            '49075d44.432d44'
          ]
        ]
      },
      {
        'id' : '5c2fd91f.e496a8',
        'type' : 'http response',
        'z' : 'e415e43d.f10178',
        'name' : '',
        'statusCode' : '',
        'x' : 717,
        'y' : 521,
        'wires' : []
      },
      {
        'id' : '49075d44.432d44',
        'type' : 'function',
        'z' : 'e415e43d.f10178',
        'name' : 'transform',
        'func' : '\nlet factories = global.get("factories"); \n\nmsg.payload = factories.messages.generic.fail;\n    \nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 501,
        'y' : 520,
        'wires' : [
          [
            '5c2fd91f.e496a8'
          ]
        ]
      },
      {
        'id' : '52020f08.81f6a',
        'type' : 'http response',
        'z' : 'e415e43d.f10178',
        'name' : '',
        'statusCode' : '',
        'x' : 2530,
        'y' : 280,
        'wires' : []
      },
      {
        'id' : 'c1ff735e.f6bd1',
        'type' : 'http in',
        'z' : 'e415e43d.f10178',
        'name' : 'send',
        'url' : '/tx/send',
        'method' : 'post',
        'upload' : false,
        'swaggerDoc' : '',
        'x' : 250,
        'y' : 280,
        'wires' : [
          [
            '846bccf0.13ca8',
            'f83b2863.aad158'
          ]
        ]
      },
      {
        'id' : '846bccf0.13ca8',
        'type' : 'function',
        'z' : 'e415e43d.f10178',
        'name' : 'transform params',
        'func' : 'msg.payload ={\n    method: \'decoderawtransaction\',\n    params: [msg.req.body.tx]\n}\n\n\n\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 430,
        'y' : 220,
        'wires' : [
          [
            'e5b429d6.0a4958'
          ]
        ]
      },
      {
        'id' : 'e5b429d6.0a4958',
        'type' : 'bcoin',
        'z' : 'e415e43d.f10178',
        'mode' : '1',
        'method' : '',
        'name' : 'bcoin',
        'x' : 630,
        'y' : 220,
        'wires' : [
          [
            '7202f6c0.e337d8',
            '321ab38b.cd676c'
          ]
        ]
      },
      {
        'id' : '7202f6c0.e337d8',
        'type' : 'function',
        'z' : 'e415e43d.f10178',
        'name' : '',
        'func' : 'let tx = msg.payload;\n\nmsg.payload = tx.vin.map(vin=>({\n    method: \'getrawtransaction\',\n    params: [vin.txid, true]\n}));\n\n\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 790,
        'y' : 140,
        'wires' : [
          [
            '436be5f6.7679bc'
          ]
        ]
      },
      {
        'id' : '436be5f6.7679bc',
        'type' : 'split',
        'z' : 'e415e43d.f10178',
        'name' : '',
        'splt' : '\\n',
        'spltType' : 'str',
        'arraySplt' : 1,
        'arraySpltType' : 'len',
        'stream' : false,
        'addname' : '',
        'x' : 930,
        'y' : 140,
        'wires' : [
          [
            'd9f47d68.e1c79'
          ]
        ]
      },
      {
        'id' : 'd9f47d68.e1c79',
        'type' : 'bcoin',
        'z' : 'e415e43d.f10178',
        'mode' : '1',
        'method' : '',
        'name' : 'bcoin',
        'x' : 1070,
        'y' : 140,
        'wires' : [
          [
            '94aa111f.45cf'
          ]
        ]
      },
      {
        'id' : '94aa111f.45cf',
        'type' : 'join',
        'z' : 'e415e43d.f10178',
        'name' : '',
        'mode' : 'auto',
        'build' : 'string',
        'property' : 'payload',
        'propertyType' : 'msg',
        'key' : 'topic',
        'joiner' : '\\n',
        'joinerType' : 'str',
        'accumulate' : false,
        'timeout' : '',
        'count' : '',
        'x' : 1190,
        'y' : 140,
        'wires' : [
          [
            '321ab38b.cd676c'
          ]
        ]
      },
      {
        'id' : '235cd94f.34d146',
        'type' : 'function',
        'z' : 'e415e43d.f10178',
        'name' : '',
        'func' : 'const _ = global.get(\'_\');\ntx = msg.payload[0];\ninputs = msg.payload[0].vin.map((vin, i)=>msg.payload[1][i].vout[vin.vout]);\n\n  let voutAddresses = _.chain(tx.vout)\n    .map(vout => _.get(vout, \'scriptPubKey.addresses\', []))\n    .flattenDeep()\n    .uniq()\n    .value();\n\n\n let vinAddresses = _.chain(inputs)\n    .map(vout => _.get(vout, \'scriptPubKey.addresses\', []))\n    .flattenDeep()\n    .uniq()\n    .value();\n\n  let addresses = _.chain(voutAddresses)\n    .union(vinAddresses)\n    .flattenDeep()\n    .uniq()\n    .value();\n\n  tx.inputs = inputs;\n  tx.outputs = tx.vout.map(v => ({\n    value: Math.floor(v.value * Math.pow(10, 8)),\n    scriptPubKey: v.scriptPubKey,\n    addresses: v.scriptPubKey.addresses\n  }));\n\n  for (let i = 0; i < tx.inputs.length; i++) {\n    tx.inputs[i] = {\n      addresses: tx.inputs[i].scriptPubKey.addresses,\n      prev_hash: tx.vin[i].txid, //eslint-disable-line\n      script: tx.inputs[i].scriptPubKey,\n      value: Math.floor(tx.inputs[i].value * Math.pow(10, 8)),\n      output_index: tx.vin[i].vout //eslint-disable-line\n    };\n  }\n\n  tx.valueIn = _.chain(tx.inputs)\n    .map(i => i.value)\n    .sum()\n    .value();\n\n  tx.valueOut = _.chain(tx.outputs)\n    .map(i => i.value)\n    .sum()\n    .value();\n\n  tx.fee = tx.valueIn - tx.valueOut;\n\n  msg.payload = _.omit(tx, [\'vin\', \'vout\', \'blockhash\']);\n\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 1410,
        'y' : 220,
        'wires' : [
          [
            'f83b2863.aad158'
          ]
        ]
      },
      {
        'id' : '321ab38b.cd676c',
        'type' : 'join',
        'z' : 'e415e43d.f10178',
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
        'x' : 1270,
        'y' : 220,
        'wires' : [
          [
            '235cd94f.34d146'
          ]
        ]
      },
      {
        'id' : 'f046e3b8.a45e7',
        'type' : 'debug',
        'z' : 'e415e43d.f10178',
        'name' : '',
        'active' : true,
        'console' : 'false',
        'complete' : 'false',
        'x' : 1670,
        'y' : 220,
        'wires' : []
      },
      {
        'id' : 'f83b2863.aad158',
        'type' : 'join',
        'z' : 'e415e43d.f10178',
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
        'x' : 1530,
        'y' : 280,
        'wires' : [
          [
            '1ff720fb.b7dadf',
            'f046e3b8.a45e7',
            '6e249aef.64cab4'
          ]
        ]
      },
      {
        'id' : '1ff720fb.b7dadf',
        'type' : 'function',
        'z' : 'e415e43d.f10178',
        'name' : '',
        'func' : 'let tx = msg.payload[0].tx;\n\nmsg.payload ={\n    method: \'sendrawtransaction\',\n    params: [tx]\n}\n\n\n\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 1670,
        'y' : 340,
        'wires' : [
          [
            '8963f835.903bc8',
            '18444088.44db0f'
          ]
        ]
      },
      {
        'id' : '8963f835.903bc8',
        'type' : 'bcoin',
        'z' : 'e415e43d.f10178',
        'mode' : '1',
        'method' : '',
        'name' : 'bcoin',
        'x' : 1820.40980529785,
        'y' : 339.420143127441,
        'wires' : [
          [
            '73ad4bd9.bb6474'
          ]
        ]
      },
      {
        'id' : '73ad4bd9.bb6474',
        'type' : 'function',
        'z' : 'e415e43d.f10178',
        'name' : '',
        'func' : 'let hash = msg.payload;\n\nmsg.payload ={\n    method: \'getrawmempool\',\n    params: [true]\n}\n\n\n\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 1963.4132232666,
        'y' : 338.569465637207,
        'wires' : [
          [
            '9e0c1179.19628'
          ]
        ]
      },
      {
        'id' : '9e0c1179.19628',
        'type' : 'bcoin',
        'z' : 'e415e43d.f10178',
        'mode' : '1',
        'method' : '',
        'params' : [],
        'name' : 'bcoin',
        'x' : 2103.74317932129,
        'y' : 338.864601135254,
        'wires' : [
          [
            '6e249aef.64cab4'
          ]
        ]
      },
      {
        'id' : '6e249aef.64cab4',
        'type' : 'join',
        'z' : 'e415e43d.f10178',
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
        'x' : 2250,
        'y' : 280,
        'wires' : [
          [
            '18444088.44db0f',
            '5c013a80.85a484'
          ]
        ]
      },
      {
        'id' : '18444088.44db0f',
        'type' : 'debug',
        'z' : 'e415e43d.f10178',
        'name' : '',
        'active' : true,
        'console' : 'false',
        'complete' : 'false',
        'x' : 2230,
        'y' : 100,
        'wires' : []
      },
      {
        'id' : '5c013a80.85a484',
        'type' : 'function',
        'z' : 'e415e43d.f10178',
        'name' : '',
        'func' : 'const _ = global.get(\'_\');\n\nlet memTxs = msg.payload[1];\nlet tx = msg.payload[0][1];\n\ntx.time = _.get(memTxs, `${tx.hash}.time`, 0);\n\nmsg.payload = tx;\n\nreturn msg;',
        'outputs' : 1,
        'noerr' : 0,
        'x' : 2391.52088928223,
        'y' : 280.687507629395,
        'wires' : [
          [
            '52020f08.81f6a'
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
    'path': 'e415e43d.f10178'
  }, done);
  done();
};
