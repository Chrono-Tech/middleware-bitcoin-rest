
module.exports.id = 'e415e43d.f10178';

const _ = require('lodash'),
  config = require('../config');

/**
 * @description flow e415e43d.f10178 update
 * @param done
 */
   

module.exports.up = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.update({"path":"e415e43d.f10178","type":"flows"}, {
    $set: {"path":"e415e43d.f10178","body":[{"id":"b68ffffb.8e49e","type":"catch","z":"e415e43d.f10178","name":"","scope":null,"x":100,"y":560,"wires":[["49075d44.432d44","f887538c.f12a8"]]},{"id":"5c2fd91f.e496a8","type":"http response","z":"e415e43d.f10178","name":"","statusCode":"","x":557,"y":561,"wires":[]},{"id":"49075d44.432d44","type":"function","z":"e415e43d.f10178","name":"transform","func":"let factories = global.get(\"factories\"); \n\nmsg.payload = factories.messages.generic.fail;\n\nif (msg.statusCode == '401')\n    msg.payload = factories.messages.generic.failAuth;\n\nreturn msg;","outputs":1,"noerr":0,"x":341,"y":560,"wires":[["5c2fd91f.e496a8"]]},{"id":"c1ff735e.f6bd1","type":"http in","z":"e415e43d.f10178","name":"send","url":"/tx/send","method":"post","upload":false,"swaggerDoc":"","x":70,"y":40,"wires":[["6a2f021f.5783ec"]]},{"id":"a83f15e5.fc4b28","type":"async-function","z":"e415e43d.f10178","name":"","func":"const _ = global.get('_');\nconst genericMessages = global.get('factories').messages.generic;\nconst txMessages = global.get('factories').messages.tx;\n\nconst rpc = global.get('rpc');\n\n\n  if (!msg.payload.tx) {\n     throw new Error(genericMessages.notEnoughArgs);\n  }\n\n  let tx = await rpc('decoderawtransaction', [msg.payload.tx]);\n\n  let voutAddresses = _.chain(tx.vout)\n    .map(vout => _.get(vout, 'scriptPubKey.addresses', []))\n    .flattenDeep()\n    .uniq()\n    .value();\n\n  let inputs = await Promise.mapSeries(tx.vin, async vin => {\n    let tx = await rpc('getrawtransaction', [vin.txid, true]);\n    return tx.vout[vin.vout];\n  }).catch(() => Promise.reject(txMessages.wrongTx));\n\n  let vinAddresses = _.chain(inputs)\n    .map(vout => _.get(vout, 'scriptPubKey.addresses', []))\n    .flattenDeep()\n    .uniq()\n    .value();\n\n  let addresses = _.chain(voutAddresses)\n    .union(vinAddresses)\n    .flattenDeep()\n    .uniq()\n    .value();\n\n  tx.inputs = inputs;\n  tx.outputs = tx.vout.map(v => ({\n    value: Math.floor(v.value * Math.pow(10, 8)),\n    scriptPubKey: v.scriptPubKey,\n    addresses: v.scriptPubKey.addresses\n  }));\n\n  for (let i = 0; i < tx.inputs.length; i++) {\n    tx.inputs[i] = {\n      addresses: tx.inputs[i].scriptPubKey.addresses,\n      prev_hash: tx.vin[i].txid, //eslint-disable-line\n      script: tx.inputs[i].scriptPubKey,\n      value: Math.floor(tx.inputs[i].value * Math.pow(10, 8)),\n      output_index: tx.vin[i].vout //eslint-disable-line\n    };\n  }\n\n  tx.valueIn = _.chain(tx.inputs)\n    .map(i => i.value)\n    .sum()\n    .value();\n\n  tx.valueOut = _.chain(tx.outputs)\n    .map(i => i.value)\n    .sum()\n    .value();\n\n  tx.fee = tx.valueIn - tx.valueOut;\n  tx = _.omit(tx, ['vin', 'vout', 'blockhash']);\n\n  let hash = await rpc('sendrawtransaction', [msg.payload.tx]);\n  let memTxs = await rpc('getrawmempool', [true]);\n\n  tx.time = _.get(memTxs, `${hash}.time`, 0);\n  \n  msg.payload = tx;\n  return msg;\n  ","outputs":1,"noerr":12,"x":390,"y":80,"wires":[["c95e3eeb.97f9d"]]},{"id":"c95e3eeb.97f9d","type":"http response","z":"e415e43d.f10178","name":"","statusCode":"","x":690,"y":80,"wires":[]},{"id":"9758d2b4.28879","type":"http in","z":"e415e43d.f10178","name":"history","url":"/tx/:addr/history","method":"get","upload":false,"swaggerDoc":"","x":70,"y":120,"wires":[["a925ad10.e799c"]]},{"id":"ca42ccf2.cc3ff","type":"function","z":"e415e43d.f10178","name":"prepare request","func":"const prefix = global.get('settings.mongo.collectionPrefix');\nconst _ = global.get('_');\n\nmsg.address = msg.req.params.addr;\n\nconst skip = parseInt(msg.req.query.skip) || 0;\nconst limit = parseInt(msg.req.query.limit) || 100;\nconst maxConfirmations = _.isNumber(parseInt(msg.req.query.maxconfirmations)) ? parseInt(msg.req.query.maxconfirmations) : -1;\n\nmsg.currentBlock = _.get(msg.payload, '0.number', 0);\n\nconst query = [\n    {$match: {address: msg.address}},\n    {$project:{\n       address:1, \n       inputBlock: 1, \n       outputBlock:1, \n       outputTxIndex: 1, \n       inputTxIndex: 1, \n       uniqOutput: {$concat: [{$substr:[\"$outputBlock\", 0, -1 ]},  {$substr:[\"$outputTxIndex\", 0, -1 ]}]},\n       uniqInput: {$concat: [{$substr:[\"$inputBlock\", 0, -1 ]},  {$substr:[\"$inputTxIndex\", 0, -1 ]}]}\n       }},\n    {$group:{\"_id\": 1,  \n        input: { $push:  { inputBlock: \"$inputBlock\", inputTxIndex: \"$inputTxIndex\", _id: \"$uniqInput\" } },\n        output: { $push:  { outputBlock: \"$outputBlock\", outputTxIndex: \"$outputTxIndex\", _id: \"$uniqOutput\" } }\n        }},\n        \n    {$project: {\n        inputs: {\n            $filter: {\n               input: \"$input\",\n               as: \"item\",\n               cond: { $ifNull: [\"$$item.inputBlock\", false] }\n            }\n        },\n        outputs: {\n            $filter: {\n               input: \"$output\",\n               as: \"item\",\n               cond: { $ifNull: [\"$$item.outputBlock\", false] }\n            }\n        }\n        }},\n    {$project: {items: {$concatArrays: [ \"$inputs\", \"$outputs\" ]}}},\n    {$unwind: \"$items\"},\n    {$group: {\n        _id: \"$items._id\", \n        items: {\n            $addToSet: {\n                block: {\n                    $ifNull: [\"$items.inputBlock\", \"$items.outputBlock\"]\n                }, \n                txIndex: {\n                    $ifNull: [\"$items.inputTxIndex\", \"$items.outputTxIndex\"]\n                }\n            }\n        }}\n    },\n    {$unwind: \"$items\"},\n    {$project: {\n        block: \"$items.block\",\n        txIndex: \"$items.txIndex\",\n        confirmations: { \n            $cond: { \n                if: {$eq: [\"$items.block\", -1]}, \n                then: 0, \n                else: {$subtract: [msg.currentBlock + 1, \"$items.block\"]}\n                    }\n                    }\n    }},\n  //  {$sort: {confirmations: 1}},\n//    {$skip: skip},\n //   {$limit: limit > 100 ? 100 : limit}\n];\n\n\nif(maxConfirmations > -1)\n    query.push({$match: {confirmations: {$lte: maxConfirmations}}})\n\nquery.push(...[\n    {$sort: {confirmations: 1}},\n    {$skip: skip},\n    {$limit: limit > 100 ? 100 : limit}\n]);\n\nmsg.payload ={ \n    model: `${prefix}Coin`, \n    request: query\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":600,"y":180,"wires":[["e6aea25e.ce0d9"]]},{"id":"e6aea25e.ce0d9","type":"mongo","z":"e415e43d.f10178","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"4","dbAlias":"primary.data","x":790,"y":180,"wires":[["bcfa0a27.cb3308"]]},{"id":"86a9e0c2.636de","type":"http response","z":"e415e43d.f10178","name":"","statusCode":"","x":1930,"y":240,"wires":[]},{"id":"bcfa0a27.cb3308","type":"function","z":"e415e43d.f10178","name":"prepare txs request","func":"const prefix = global.get('settings.mongo.collectionPrefix');\nconst _ = global.get('_');\n\nmsg.address = msg.req.params.addr;\n\nconst coins = msg.payload;\n\nif(!coins.length)\n    return msg;\n\n\nmsg.payload =[\n{ \n    model: `${prefix}Tx`, \n    request: {\n      $or: coins.map(coin=>({\n          blockNumber: coin.block,\n          index: coin.txIndex\n      }))\n  }\n},\n\n{ \n    model: `${prefix}Coin`, \n    request: {\n      $or: _.chain(coins).map(coin=>\n    [\n      {\n        inputBlock: coin.block,\n        inputTxIndex: coin.txIndex\n      },\n      {\n        outputBlock: coin.block,\n        outputTxIndex: coin.txIndex\n      }\n    ]\n    )\n    .flattenDeep()\n    .value()\n  }\n}\n\n\n];\n\nreturn msg;","outputs":1,"noerr":0,"x":1010,"y":180,"wires":[["c9db2cc4.ccb9d"]]},{"id":"7d843c05.8e4314","type":"split","z":"e415e43d.f10178","name":"","splt":"\\n","spltType":"str","arraySplt":1,"arraySpltType":"len","stream":false,"addname":"","x":1330,"y":240,"wires":[["b15576e1.7f9808"]]},{"id":"b15576e1.7f9808","type":"mongo","z":"e415e43d.f10178","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":1470,"y":240,"wires":[["f008bb44.bea2b8"]]},{"id":"f008bb44.bea2b8","type":"join","z":"e415e43d.f10178","name":"join ","mode":"auto","build":"string","property":"payload","propertyType":"msg","key":"topic","joiner":"\\n","joinerType":"str","accumulate":false,"timeout":"","count":"","x":1610,"y":240,"wires":[["55773ce3.fa5be4"]]},{"id":"55773ce3.fa5be4","type":"function","z":"e415e43d.f10178","name":"prepare response","func":"const _ = global.get('_');\nconst prefix = global.get('settings.mongo.collectionPrefix');\n\n\nlet txs =  _.has(msg.payload, '0.0.index') ? msg.payload[0] : msg.payload[1];\n\nif(!txs || !txs.length){\n    msg.payload = [];\n    return msg;\n}\n\nconst coins = _.has(msg.payload, '0.0.index') ? _.get(msg.payload, '1', []) : _.get(msg.payload, '0', []);\n\n\nmsg.payload = _.chain(txs).map(tx=>{\n    \n    tx.hash = tx._id;\n    tx.inputs = _.chain(coins)\n      .filter({inputBlock: tx.blockNumber, inputTxIndex: tx.index})\n      .orderBy('inputIndex')\n      .map(coin => ({\n        address: coin.address,\n        value: coin.value\n      }))\n      .value();\n\n    tx.outputs = _.chain(coins)\n      .filter({outputBlock: tx.blockNumber, outputTxIndex: tx.index})\n      .orderBy('outputIndex')\n      .map(coin => ({\n        address: coin.address,\n        value: coin.value\n      }))\n      .value();\n\n    tx.confirmations = tx.blockNumber === -1 ? 0 :  (msg.currentBlock || tx.blockNumber - 2) - tx.blockNumber + 1;\n\n   delete tx._id;\n   delete tx.__v;\n\n    return  tx;\n    \n})\n.orderBy('timestamp', 'desc')\n.value();\n\n\nreturn msg;","outputs":1,"noerr":0,"x":1770,"y":240,"wires":[["86a9e0c2.636de"]]},{"id":"c9db2cc4.ccb9d","type":"switch","z":"e415e43d.f10178","name":"switch","property":"payload.length","propertyType":"msg","rules":[{"t":"eq","v":"0","vt":"str"},{"t":"neq","v":"0","vt":"str"}],"checkall":"true","outputs":2,"x":1197.076431274414,"y":179.98612213134766,"wires":[["25322d93.95cd12"],["7d843c05.8e4314"]]},{"id":"25322d93.95cd12","type":"http response","z":"e415e43d.f10178","name":"","statusCode":"","x":1330,"y":160,"wires":[]},{"id":"f887538c.f12a8","type":"debug","z":"e415e43d.f10178","name":"","active":true,"console":"false","complete":"error","x":406,"y":672,"wires":[]},{"id":"264d8893.182eb8","type":"function","z":"e415e43d.f10178","name":"prepare response","func":"const prefix = global.get('settings.mongo.collectionPrefix');\n\n\nmsg.payload = { \n    model: `${prefix}Block`, \n    request: {},\n    options: {\n      sort: {number: -1},\n      limit: 1\n  }\n};\n\n\n\nreturn msg;","outputs":1,"noerr":0,"x":290,"y":180,"wires":[["f6d8e494.19a208"]]},{"id":"f6d8e494.19a208","type":"mongo","z":"e415e43d.f10178","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":450,"y":180,"wires":[["ca42ccf2.cc3ff"]]},{"id":"e544b54b.f6c828","type":"http in","z":"e415e43d.f10178","name":"tx","url":"/tx/:hash","method":"get","upload":false,"swaggerDoc":"","x":70,"y":340,"wires":[["e5c01fa3.3a1e6"]]},{"id":"3ae19882.ad9138","type":"mongo","z":"e415e43d.f10178","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":510,"y":420,"wires":[["67f02701.841798"]]},{"id":"1f7f8a6b.9049b6","type":"http response","z":"e415e43d.f10178","name":"","statusCode":"","x":1690,"y":480,"wires":[]},{"id":"a68c1f33.fddb2","type":"mongo","z":"e415e43d.f10178","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":1350,"y":480,"wires":[["155c0029.879a5"]]},{"id":"155c0029.879a5","type":"function","z":"e415e43d.f10178","name":"prepare response","func":"const _ = global.get('_');\nconst prefix = global.get('settings.mongo.collectionPrefix');\n\n\nconst coins = msg.payload;\n\n\n    \nmsg.tx.hash = msg.tx._id;\nmsg.tx.inputs = _.chain(coins)\n  .filter({inputBlock: msg.tx.blockNumber, inputTxIndex: msg.tx.index})\n  .orderBy('inputIndex')\n  .map(coin => ({\n    address: coin.address,\n    value: coin.value\n  }))\n  .value();\n\nmsg.tx.outputs = _.chain(coins)\n  .filter({outputBlock: msg.tx.blockNumber, outputTxIndex: msg.tx.index})\n  .orderBy('outputIndex')\n  .map(coin => ({\n    address: coin.address,\n    value: coin.value\n  }))\n  .value();\n\nmsg.tx.confirmations = msg.tx.blockNumber === -1 ? 0 :  (msg.blockNumber || msg.tx.blockNumber - 2) - msg.tx.blockNumber + 1;\n\ndelete msg.tx._id;\ndelete msg.tx.__v;\n\nmsg.payload = msg.tx;\n\n\n\nreturn msg;","outputs":1,"noerr":0,"x":1530,"y":480,"wires":[["1f7f8a6b.9049b6"]]},{"id":"eb4c710d.5d663","type":"switch","z":"e415e43d.f10178","name":"switch","property":"payload","propertyType":"msg","rules":[{"t":"null"},{"t":"nnull"}],"checkall":"true","repair":false,"outputs":2,"x":1217.076431274414,"y":419.98612213134766,"wires":[["2b378d84.f0f232"],["a68c1f33.fddb2"]]},{"id":"2b378d84.f0f232","type":"http response","z":"e415e43d.f10178","name":"","statusCode":"","x":1350,"y":400,"wires":[]},{"id":"58c5ca38.81edc4","type":"function","z":"e415e43d.f10178","name":"prepare block request","func":"const prefix = global.get('settings.mongo.collectionPrefix');\n\n\nmsg.payload = { \n    model: `${prefix}Block`, \n    request: {},\n    options: {\n      sort: {number: -1},\n      limit: 1\n  }\n};\n\n\n\nreturn msg;","outputs":1,"noerr":0,"x":320,"y":420,"wires":[["3ae19882.ad9138"]]},{"id":"67f02701.841798","type":"function","z":"e415e43d.f10178","name":"prepare tx request","func":"const prefix = global.get('settings.mongo.collectionPrefix');\nconst _ = global.get('_');\n\nmsg.blockNumber = _.get(msg.payload, '0.number', -1);\n\nmsg.payload ={ \n    model: `${prefix}Tx`, \n    request: {\n      _id: msg.req.params.hash\n  }\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":670,"y":420,"wires":[["b0044a34.06f628"]]},{"id":"c9b93241.91d51","type":"function","z":"e415e43d.f10178","name":"prepare tx request","func":"const prefix = global.get('settings.mongo.collectionPrefix');\nconst _ = global.get('_');\n\nmsg.tx = msg.payload[0];\n\nif(!msg.tx){\n    msg.payload = null;\n    return msg;\n}\n\nmsg.payload ={ \n    model: `${prefix}Coin`, \n    request: {\n      $or: [\n            {inputBlock: msg.tx.blockNumber, inputTxIndex: msg.tx.index},\n            {outputBlock: msg.tx.blockNumber, outputTxIndex: msg.tx.index}\n          ]\n  }\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":1030,"y":420,"wires":[["eb4c710d.5d663"]]},{"id":"b0044a34.06f628","type":"mongo","z":"e415e43d.f10178","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":850,"y":420,"wires":[["c9b93241.91d51"]]},{"id":"6a2f021f.5783ec","type":"laborx_auth","z":"e415e43d.f10178","name":"laborx_auth","configprovider":"1","dbAlias":"accounts","providerpath":"http://localhost:3001","x":210,"y":80,"wires":[["a83f15e5.fc4b28"]]},{"id":"a925ad10.e799c","type":"laborx_auth","z":"e415e43d.f10178","name":"laborx_auth","configprovider":"1","dbAlias":"accounts","providerpath":"http://localhost:3001","x":110,"y":180,"wires":[["264d8893.182eb8"]]},{"id":"e5c01fa3.3a1e6","type":"laborx_auth","z":"e415e43d.f10178","name":"laborx_auth","configprovider":"1","dbAlias":"accounts","providerpath":"http://localhost:3001","x":110,"y":420,"wires":[["58c5ca38.81edc4"]]}]}
  }, {upsert: true}, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.remove({"path":"e415e43d.f10178","type":"flows"}, done);
};
