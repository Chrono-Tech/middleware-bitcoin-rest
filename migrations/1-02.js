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
        'func' : '\nlet factories = global.get("factories"); \nlet error = msg.error.message;\ntry {\n    error = JSON.parse(error);\n}catch(e){}\n\nmsg.payload = error && error.code === 11000 ? \nfactories.messages.address.existAddress :\n\nmsg.error.message && msg.error.code ?\nmsg.error :\nfactories.messages.generic.fail;\n   \nreturn msg;',
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
            'a83f15e5.fc4b28'
          ]
        ]
      },
      {
        'id' : 'a83f15e5.fc4b28',
        'type' : 'async-function',
        'z' : 'e415e43d.f10178',
        'name' : '',
        'func' : 'const _ = global.get(\'_\');\nconst genericMessages = global.get(\'factories\').messages.generic;\nconst txMessages = global.get(\'factories\').messages.tx;\n\nconst rpc = global.get(\'rpc\');\n\n\n  if (!msg.payload.tx) {\n     throw new Error(genericMessages.notEnoughArgs);\n  }\n\n  let tx = await rpc(\'decoderawtransaction\', [msg.payload.tx]);\n\n  let voutAddresses = _.chain(tx.vout)\n    .map(vout => _.get(vout, \'scriptPubKey.addresses\', []))\n    .flattenDeep()\n    .uniq()\n    .value();\n\n  let inputs = await Promise.mapSeries(tx.vin, async vin => {\n    let tx = await rpc(\'getrawtransaction\', [vin.txid, true]);\n    return tx.vout[vin.vout];\n  }).catch(() => Promise.reject(txMessages.wrongTx));\n\n  let vinAddresses = _.chain(inputs)\n    .map(vout => _.get(vout, \'scriptPubKey.addresses\', []))\n    .flattenDeep()\n    .uniq()\n    .value();\n\n  let addresses = _.chain(voutAddresses)\n    .union(vinAddresses)\n    .flattenDeep()\n    .uniq()\n    .value();\n\n  tx.inputs = inputs;\n  tx.outputs = tx.vout.map(v => ({\n    value: Math.floor(v.value * Math.pow(10, 8)),\n    scriptPubKey: v.scriptPubKey,\n    addresses: v.scriptPubKey.addresses\n  }));\n\n  for (let i = 0; i < tx.inputs.length; i++) {\n    tx.inputs[i] = {\n      addresses: tx.inputs[i].scriptPubKey.addresses,\n      prev_hash: tx.vin[i].txid, //eslint-disable-line\n      script: tx.inputs[i].scriptPubKey,\n      value: Math.floor(tx.inputs[i].value * Math.pow(10, 8)),\n      output_index: tx.vin[i].vout //eslint-disable-line\n    };\n  }\n\n  tx.valueIn = _.chain(tx.inputs)\n    .map(i => i.value)\n    .sum()\n    .value();\n\n  tx.valueOut = _.chain(tx.outputs)\n    .map(i => i.value)\n    .sum()\n    .value();\n\n  tx.fee = tx.valueIn - tx.valueOut;\n  tx = _.omit(tx, [\'vin\', \'vout\', \'blockhash\']);\n\n  let hash = await rpc(\'sendrawtransaction\', [msg.payload.tx]);\n  let memTxs = await rpc(\'getrawmempool\', [true]);\n\n  tx.time = _.get(memTxs, `${hash}.time`, 0);\n  \n  msg.payload = tx;\n  return msg;\n  ',
        'outputs' : 1,
        'noerr' : 12,
        'x' : 490,
        'y' : 280,
        'wires' : [
          [
            'c95e3eeb.97f9d'
          ]
        ]
      },
      {
        'id' : 'c95e3eeb.97f9d',
        'type' : 'http response',
        'z' : 'e415e43d.f10178',
        'name' : '',
        'statusCode' : '',
        'x' : 790,
        'y' : 280,
        'wires' : []
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
