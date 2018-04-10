
module.exports.id = '19.2c9dd332.05334c';

const _ = require('lodash'),
  config = require('../config');

/**
 * @description flow 2c9dd332.05334c update
 * @param done
 */
   

module.exports.up = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.update({"path":"2c9dd332.05334c","type":"flows"}, {
    $set: {"path":"2c9dd332.05334c","body":[{"id":"5a35929d.0a716c","type":"http in","z":"2c9dd332.05334c","name":"create addr","url":"/addr","method":"post","upload":false,"swaggerDoc":"","x":90,"y":160,"wires":[["eac07b2d.a3a898"]]},{"id":"e4822e75.693fd","type":"http response","z":"2c9dd332.05334c","name":"","statusCode":"","headers":{},"x":2170,"y":80,"wires":[]},{"id":"65927d71.4e8c44","type":"http in","z":"2c9dd332.05334c","name":"remove addr","url":"/addr","method":"delete","upload":false,"swaggerDoc":"","x":250,"y":620,"wires":[["316484c0.63001c"]]},{"id":"d0426981.27e8a8","type":"http response","z":"2c9dd332.05334c","name":"","statusCode":"","x":1190,"y":620,"wires":[]},{"id":"7c68e0a0.c140d","type":"mongo","z":"2c9dd332.05334c","model":"EthAccount","request":"{}","options":"","name":"mongo","mode":"1","requestType":"2","dbAlias":"primary.accounts","x":650,"y":620,"wires":[["d7c0637b.46c32"]]},{"id":"cdd0bdcd.24b59","type":"function","z":"2c9dd332.05334c","name":"transform output","func":"\nlet factories = global.get(\"factories\"); \n\nif(msg.payload.error){\n    msg.payload = factories.messages.generic.fail;\n    return msg;\n}\n    \n    \nmsg.payload = factories.messages.generic.success;\nreturn msg;","outputs":1,"noerr":0,"x":960,"y":620,"wires":[["d0426981.27e8a8"]]},{"id":"316484c0.63001c","type":"function","z":"2c9dd332.05334c","name":"transform params","func":"const prefix = global.get('settings.mongo.accountPrefix');\n\nmsg.address = msg.payload.address;\n\nmsg.payload = {\n    model: `${prefix}Account`, \n    request: [{\n       address: msg.address\n   }, {isActive: false}]\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":450,"y":620,"wires":[["7c68e0a0.c140d"]]},{"id":"468de3dc.eb162c","type":"http in","z":"2c9dd332.05334c","name":"balance","url":"/addr/:addr/balance","method":"get","upload":false,"swaggerDoc":"","x":110,"y":920,"wires":[["6731d0f7.68fb4"]]},{"id":"6731d0f7.68fb4","type":"function","z":"2c9dd332.05334c","name":"transform params","func":"const prefix = global.get('settings.mongo.accountPrefix');\n\n\nmsg.payload = {\n    model: `${prefix}Account`, \n    request: {\n       address: msg.req.params.addr\n   }\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":310,"y":920,"wires":[["a66b89d5.08b868"]]},{"id":"a66b89d5.08b868","type":"mongo","z":"2c9dd332.05334c","model":"EthAccount","request":"{}","options":"","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.accounts","x":502.50000381469795,"y":921.24999904632,"wires":[["36a27ede.06cd52"]]},{"id":"36a27ede.06cd52","type":"function","z":"2c9dd332.05334c","name":"transform output","func":"\nconst _ = global.get('_');\n\nlet account = msg.payload[0];\n\n\nmsg.payload = {\n    confirmations0: {\n      satoshis: _.get(account, 'balances.confirmations0', 0),\n      amount: _.get(account, 'balances.confirmations0', 0) / 100000000\n    },\n    confirmations3: {\n      satoshis: _.get(account, 'balances.confirmations3', 0),\n      amount: _.get(account, 'balances.confirmations3', 0) / 100000000\n    },\n    confirmations6: {\n      satoshis: _.get(account, 'balances.confirmations6', 0),\n      amount: _.get(account, 'balances.confirmations6', 0) / 100000000\n    },\n  };\n\n\nreturn msg;","outputs":1,"noerr":0,"x":696.250007629395,"y":921.24999904632,"wires":[["6e227f25.b210e"]]},{"id":"6e227f25.b210e","type":"http response","z":"2c9dd332.05334c","name":"","statusCode":"","x":931.250007629395,"y":919.99999904632,"wires":[]},{"id":"e859d127.685df","type":"catch","z":"2c9dd332.05334c","name":"","scope":["9d44ee1d.e443","468de3dc.eb162c","8346fba1.12d028","5a35929d.0a716c","5e8d6a6f.829244","d430cfb9.80173","c1a99120.e1907","3e6b7494.a8201c","57e2003e.f0e42","f0edc237.50ca1","c1017ee9.20a23","2897ae84.380082","54f1c0e7.3a5a7","f597c720.2602e8","b06bab45.8c4e48","fd565cdc.5b9e","2be633a7.9859fc","d0426981.27e8a8","4e47577b.ea57f8","e4822e75.693fd","6e227f25.b210e","cfe70bd2.1b0638","4945e333.41fc8c","a66b89d5.08b868","21088134.04adae","7c68e0a0.c140d","f0afeaab.4cf7e8","2741509c.e882c","fb8909f1.457008","65927d71.4e8c44","66707387.71cc7c","3c61534d.fb608c","c0de808e.fca52","fee41eb3.787da","d7c0637b.46c32","568b5627.690888","b224dbf1.a256c8","36a27ede.06cd52","cdd0bdcd.24b59","2a6a8ea2.44a9e2","6731d0f7.68fb4","316484c0.63001c","dd761548.26d778","a315811b.0503e","375e54b9.33dc5c"],"x":180,"y":1280,"wires":[["568b5627.690888"]]},{"id":"4e47577b.ea57f8","type":"http response","z":"2c9dd332.05334c","name":"","statusCode":"","x":1030,"y":1020,"wires":[]},{"id":"375e54b9.33dc5c","type":"http in","z":"2c9dd332.05334c","name":"utxo","url":"/addr/:addr/utxo","method":"get","upload":false,"swaggerDoc":"","x":110,"y":1020,"wires":[["2be633a7.9859fc"]]},{"id":"4945e333.41fc8c","type":"join","z":"2c9dd332.05334c","name":"","mode":"auto","build":"merged","property":"payload","propertyType":"msg","key":"topic","joiner":"\\n","joinerType":"str","accumulate":false,"timeout":"","count":"2","x":690,"y":1020,"wires":[["2897ae84.380082"]]},{"id":"2897ae84.380082","type":"function","z":"2c9dd332.05334c","name":"","func":"const _ = global.get('_');\n\nlet height = msg.payload[0];\nlet rawCoins = msg.payload[1];\n\n\n\n  msg.payload =  _.chain(rawCoins)\n    .filter(c => c.height > -1)\n    .map(rawCoin => {\n      return ({\n        address: rawCoin.address,\n        txid: rawCoin.hash,\n        scriptPubKey: rawCoin.script,\n        amount: rawCoin.value / Math.pow(10, 8),\n        satoshis: rawCoin.value,\n        height: rawCoin.height,\n        vout: rawCoin.index,\n        confirmations: height - rawCoin.height + 1\n      });\n    })\n    .orderBy('height', 'desc')\n    .value();\n\nreturn msg;","outputs":1,"noerr":0,"x":850,"y":1020,"wires":[["4e47577b.ea57f8"]]},{"id":"8346fba1.12d028","type":"bcoin","z":"2c9dd332.05334c","mode":"1","method":"","providerpath":"","params":[],"provideroption":"","name":"bcoin","x":550,"y":1020,"wires":[["4945e333.41fc8c"]]},{"id":"2be633a7.9859fc","type":"function","z":"2c9dd332.05334c","name":"","func":"\nmsg.req.address = msg.payload.address\n\nmsg.payload = [{\n    method: 'getblockcount', \n    params: []\n}, {\n    method: 'getcoinsbyaddress',\n    params: [msg.req.params.addr]\n}];\n\nreturn msg;","outputs":1,"noerr":0,"x":290,"y":1020,"wires":[["66707387.71cc7c"]]},{"id":"66707387.71cc7c","type":"split","z":"2c9dd332.05334c","name":"","splt":"\\n","spltType":"str","arraySplt":"1","arraySpltType":"len","stream":false,"addname":"","x":410,"y":1020,"wires":[["8346fba1.12d028"]]},{"id":"352fd4a8.2620ac","type":"mongo","z":"2c9dd332.05334c","model":"EthAccount","request":"{}","options":"","name":"mongo update addr","mode":"1","requestType":"2","dbAlias":"primary.accounts","x":1420,"y":120,"wires":[["3c61534d.fb608c","c0de808e.fca52"]]},{"id":"2a6a8ea2.44a9e2","type":"function","z":"2c9dd332.05334c","name":"transform output","func":"\nlet factories = global.get(\"factories\"); \n\nif(msg.payload.error){\n    msg.payload = factories.messages.generic.fail;\n    return msg;\n}\n    \n    \nmsg.payload = factories.messages.generic.success;\nreturn msg;","outputs":1,"noerr":0,"x":2010,"y":80,"wires":[["e4822e75.693fd"]]},{"id":"fb8909f1.457008","type":"amqp in","z":"2c9dd332.05334c","name":"post addresses","topic":"${config.rabbit.serviceName}.account.create","iotype":"3","ioname":"events","noack":"0","durablequeue":"1","durableexchange":"0","server":"","servermode":"1","x":100,"y":240,"wires":[["f0edc237.50ca1"]]},{"id":"f0edc237.50ca1","type":"function","z":"2c9dd332.05334c","name":"","func":"\nmsg.payload = JSON.parse(msg.payload);\n\nreturn msg;","outputs":1,"noerr":0,"x":250,"y":240,"wires":[["eac07b2d.a3a898"]]},{"id":"d430cfb9.80173","type":"amqp out","z":"2c9dd332.05334c","name":"","topic":"${config.rabbit.serviceName}.account.created","iotype":"3","ioname":"events","server":"","servermode":"1","x":2190,"y":140,"wires":[]},{"id":"3c61534d.fb608c","type":"switch","z":"2c9dd332.05334c","name":"","property":"amqpMessage","propertyType":"msg","rules":[{"t":"null"},{"t":"nnull"}],"checkall":"true","outputs":2,"x":1690,"y":80,"wires":[["2a6a8ea2.44a9e2"],["fd565cdc.5b9e"]]},{"id":"fd565cdc.5b9e","type":"function","z":"2c9dd332.05334c","name":"","func":"\nif(msg.amqpMessage)\n    msg.amqpMessage.ackMsg();\n\nmsg.payload = JSON.stringify({address: msg.address})\n\nreturn msg;","outputs":1,"noerr":0,"x":1970,"y":140,"wires":[["d430cfb9.80173"]]},{"id":"5e8d6a6f.829244","type":"amqp in","z":"2c9dd332.05334c","name":"delete addresses","topic":"${config.rabbit.serviceName}.account.delete","iotype":"3","ioname":"events","noack":"0","durablequeue":"1","durableexchange":"0","server":"","servermode":"1","x":80,"y":720,"wires":[["c1017ee9.20a23"]]},{"id":"c1017ee9.20a23","type":"function","z":"2c9dd332.05334c","name":"","func":"\nmsg.payload = JSON.parse(msg.payload);\n\nreturn msg;","outputs":1,"noerr":0,"x":250,"y":720,"wires":[["316484c0.63001c"]]},{"id":"c1a99120.e1907","type":"amqp out","z":"2c9dd332.05334c","name":"","topic":"${config.rabbit.serviceName}.account.deleted","iotype":"3","ioname":"events","server":"","servermode":"1","x":1050,"y":700,"wires":[]},{"id":"54f1c0e7.3a5a7","type":"function","z":"2c9dd332.05334c","name":"","func":"\nif(msg.amqpMessage)\n    msg.amqpMessage.ackMsg();\n\nmsg.payload = JSON.stringify({address: msg.address})\n\nreturn msg;","outputs":1,"noerr":0,"x":910,"y":700,"wires":[["c1a99120.e1907"]]},{"id":"d7c0637b.46c32","type":"switch","z":"2c9dd332.05334c","name":"","property":"amqpMessage","propertyType":"msg","rules":[{"t":"null"},{"t":"nnull"}],"checkall":"true","outputs":2,"x":790,"y":620,"wires":[["cdd0bdcd.24b59"],["54f1c0e7.3a5a7"]]},{"id":"c545fec1.cec19","type":"catch","z":"2c9dd332.05334c","name":"","scope":["11fd83b0.8531dc"],"x":1320,"y":220,"wires":[["57e2003e.f0e42"]]},{"id":"57e2003e.f0e42","type":"function","z":"2c9dd332.05334c","name":"","func":"const factories = global.get('factories');\nconst prefix = global.get('settings.mongo.accountPrefix');\nconst _ = global.get('_');\n\nmsg.address = msg.payload.address;\n    \n\nmsg.fallback = true;\n\nmsg.payload = {\n    model: `${prefix}Account`, \n    request: [{\n       address: msg.address},\n       {balance: 0}]\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":1470,"y":220,"wires":[["5d4f9064.7e199","352fd4a8.2620ac"]]},{"id":"b224dbf1.a256c8","type":"function","z":"2c9dd332.05334c","name":"transform","func":"const prefix = global.get('settings.mongo.accountPrefix');\nconst factories = global.get(\"factories\"); \nlet error = msg.error.message;\n\ntry {\n    error = JSON.parse(error);\n}catch(e){}\n\nif(error.code !== 11000)\nthrow new Error(msg.error.message);\n\nmsg.payload = {\n    model: `${prefix}Account`, \n    request: [\n        {address: msg.payload.request.address}, \n        {$set:{ \n            isActive: true\n        }}\n        ]\n   \n};\n\nreturn msg;","outputs":1,"noerr":0,"x":820,"y":80,"wires":[["21088134.04adae"]]},{"id":"21088134.04adae","type":"mongo","z":"2c9dd332.05334c","model":"EthAccount","request":"{}","options":"","name":"mongo","mode":"1","requestType":"2","dbAlias":"primary.accounts","x":1000,"y":80,"wires":[["3c61534d.fb608c"]]},{"id":"1f3f3c62.d10644","type":"catch","z":"2c9dd332.05334c","name":"","scope":["e7e5dfd3.d7703"],"x":660,"y":80,"wires":[["b224dbf1.a256c8"]]},{"id":"3e6b7494.a8201c","type":"amqp out","z":"2c9dd332.05334c","name":"","topic":"${config.rabbit.serviceName}.account.balance","iotype":"3","ioname":"events","server":"","servermode":"1","x":1990,"y":200,"wires":[]},{"id":"c0de808e.fca52","type":"switch","z":"2c9dd332.05334c","name":"","property":"fallback","propertyType":"msg","rules":[{"t":"true"}],"checkall":"true","outputs":1,"x":1670,"y":200,"wires":[["f597c720.2602e8"]]},{"id":"f597c720.2602e8","type":"function","z":"2c9dd332.05334c","name":"","func":"\nif(msg.amqpMessage)\n    msg.amqpMessage.ackMsg();\n\nmsg.payload = JSON.stringify({address: msg.address})\n\nreturn msg;","outputs":1,"noerr":0,"x":1830,"y":200,"wires":[["3e6b7494.a8201c"]]},{"id":"dd761548.26d778","type":"amqp in","z":"2c9dd332.05334c","name":"update balance addresses","topic":"${config.rabbit.serviceName}.account.balance","iotype":"3","ioname":"events","noack":"0","durablequeue":"1","durableexchange":"0","server":"","servermode":"1","x":210,"y":500,"wires":[["6241bcb3.63c504"]]},{"id":"a315811b.0503e","type":"async-function","z":"2c9dd332.05334c","name":"update calc balance","func":"const _ = global.get('_');\nconst genericMessages = global.get('factories').messages.generic;\nconst prefix = global.get('settings.mongo.accountPrefix');\n\n\nif(msg.payload.error){\n    msg.payload = factories.messages.generic.fail;\n    return msg;\n}\n\nlet address = _.chain(msg.payload)\n    .map(result => result.address)\n    .uniq()\n    .value();\n\nlet balance = _.chain(msg.payload)\n    .map(result => result.value)\n    .flattenDeep()\n    .sum()\n    .value();\n\nlet lastBlock = _.chain(msg.payload)\n    .last()\n    .value();\n\n    msg.payload = {\n    model: `${prefix}Account`, \n    request: {\n       address: address,\n       lastBlockCheck: lastBlock.blockNumber,\n       balances: {\n           confirmations0: balance\n       }\n   }\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":1020,"y":500,"wires":[["f0afeaab.4cf7e8"]]},{"id":"f0afeaab.4cf7e8","type":"mongo","z":"2c9dd332.05334c","model":"EthAccount","request":"{}","options":"","name":"mongo update balance","mode":"1","requestType":"2","dbAlias":"primary.accounts","x":1330,"y":500,"wires":[["b06bab45.8c4e48"]]},{"id":"b06bab45.8c4e48","type":"function","z":"2c9dd332.05334c","name":"","func":"\nif(msg.amqpMessage)\n    msg.amqpMessage.ackMsg();\n\nmsg.payload = JSON.stringify({address: msg.address})\n\nreturn msg;","outputs":1,"noerr":0,"x":1550,"y":500,"wires":[[]]},{"id":"cfe70bd2.1b0638","type":"http response","z":"2c9dd332.05334c","name":"","statusCode":"","x":770,"y":1260,"wires":[]},{"id":"568b5627.690888","type":"function","z":"2c9dd332.05334c","name":"transform","func":"\nlet factories = global.get(\"factories\"); \nlet error = msg.error.message;\ntry {\n    error = JSON.parse(error);\n}catch(e){}\n\nmsg.payload = error && error.code === 11000 ? \nfactories.messages.address.existAddress :\nfactories.messages.generic.fail;\n   \nreturn msg;","outputs":1,"noerr":0,"x":380,"y":1280,"wires":[["fee41eb3.787da"]]},{"id":"fee41eb3.787da","type":"switch","z":"2c9dd332.05334c","name":"","property":"amqpMessage","propertyType":"msg","rules":[{"t":"null"},{"t":"nnull"}],"checkall":"true","outputs":2,"x":550,"y":1280,"wires":[["cfe70bd2.1b0638"],["9d44ee1d.e443","2741509c.e882c"]]},{"id":"9d44ee1d.e443","type":"async-function","z":"2c9dd332.05334c","name":"","func":"if(msg.error.message.includes('CONNECTION ERROR')){\n    await Promise.delay(5000);\n    await msg.amqpMessage.nackMsg();\n}else{\n    await msg.amqpMessage.ackMsg();\n}\n    \nmsg.payload = typeof msg.error.message;    \n    \nreturn msg;","outputs":1,"noerr":6,"x":770,"y":1320,"wires":[[]]},{"id":"2741509c.e882c","type":"debug","z":"2c9dd332.05334c","name":"","active":true,"console":"false","complete":"error","x":779.0729522705078,"y":1365.895881652832,"wires":[]},{"id":"5d4f9064.7e199","type":"debug","z":"2c9dd332.05334c","name":"","active":true,"console":"false","complete":"payload","x":1650,"y":280,"wires":[]},{"id":"fa455a02.465228","type":"function","z":"2c9dd332.05334c","name":"search addr","func":"const prefix = global.get('settings.mongo.collectionPrefix');\nconst genericMessages = global.get('factories').messages.generic;\n\nif(msg.payload.error){\n    msg.payload = factories.messages.generic.fail;\n    return msg;\n}\n\n    msg.payload = {\n    address: msg.payload.address,\n    model: `${prefix}UTXO`, \n    request: {\n        address: msg.payload.address\n       }\n   };\n\nreturn msg;","outputs":1,"noerr":0,"x":610,"y":160,"wires":[["c2ef3025.6ebdb"]]},{"id":"c2ef3025.6ebdb","type":"mongo","z":"2c9dd332.05334c","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":760,"y":160,"wires":[["160d7561.56984b"]]},{"id":"6241bcb3.63c504","type":"function","z":"2c9dd332.05334c","name":"search addr","func":"const prefix = global.get('settings.mongo.collectionPrefix');\nconst genericMessages = global.get('factories').messages.generic;\n\nmsg.payload = JSON.parse(msg.payload);\n\nif (!msg.payload.address) {\n     throw new Error(genericMessages.notEnoughArgs);\n  }\n\n    msg.payload = {\n    model: `${prefix}UTXO`, \n    request: {\n        address: msg.payload.address\n       }\n   };\n\nreturn msg;","outputs":1,"noerr":0,"x":550,"y":500,"wires":[["8ed0be73.c3e82"]]},{"id":"8ed0be73.c3e82","type":"mongo","z":"2c9dd332.05334c","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":720,"y":500,"wires":[["a315811b.0503e"]]},{"id":"11fd83b0.8531dc","type":"async-function","z":"2c9dd332.05334c","name":"calc balance","func":"const _ = global.get('_');\nconst genericMessages = global.get('factories').messages.generic;\nconst prefix = global.get('settings.mongo.accountPrefix');\n\n\nif(msg.payload.error){\n    msg.payload = factories.messages.generic.fail;\n    return msg;\n}\n\nlet address = _.chain(msg.payload)\n    .map(result => result.address)\n    .uniq()\n    .value();\n\nlet balance = _.chain(msg.payload)\n    .map(result => result.value)\n    .flattenDeep()\n    .sum()\n    .value();\n\nlet lastBlock = _.chain(msg.payload)\n    .last()\n    .value();\n\n    msg.payload = {\n    model: `${prefix}Account`, \n    request: [{\n       address: address},\n       {lastBlockCheck: lastBlock.blockNumber,\n       balances: {\n           confirmations0: balance\n       }}]\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":1130,"y":120,"wires":[["352fd4a8.2620ac"]]},{"id":"eac07b2d.a3a898","type":"async-function","z":"2c9dd332.05334c","name":"","func":"const prefix = global.get('settings.mongo.collectionPrefix');\nconst genericMessages = global.get('factories').messages.generic;\n\nif (!msg.payload.address) {\n     throw new Error(genericMessages.notEnoughArgs);\n}\n\nmsg.payload = {\n    model: `${prefix}Account`, \n    request: {\n       address: msg.payload.address,\n   }\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":250,"y":160,"wires":[["e7e5dfd3.d7703"]]},{"id":"e7e5dfd3.d7703","type":"mongo","z":"2c9dd332.05334c","model":"EthAccount","request":"{}","options":"","name":"mongo create addr","mode":"1","requestType":"1","dbAlias":"primary.accounts","x":430,"y":160,"wires":[["fa455a02.465228"]]},{"id":"160d7561.56984b","type":"switch","z":"2c9dd332.05334c","name":"","property":"payload.length","propertyType":"msg","rules":[{"t":"gt","v":"0","vt":"num"},{"t":"eq","v":"0","vt":"num"}],"checkall":"true","outputs":2,"x":910,"y":160,"wires":[["11fd83b0.8531dc"],["4a58a52d.1689ac"]]},{"id":"4a58a52d.1689ac","type":"function","z":"2c9dd332.05334c","name":"transform output","func":"\nlet factories = global.get(\"factories\"); \n\nif(msg.payload.error){\n    msg.payload = factories.messages.generic.fail;\n    return msg;\n}\n    \n    \nmsg.payload = factories.messages.generic.success;\nreturn msg;","outputs":1,"noerr":0,"x":1030,"y":280,"wires":[["a8266f18.7b10b"]]},{"id":"a8266f18.7b10b","type":"http response","z":"2c9dd332.05334c","name":"","statusCode":"","headers":{},"x":1210,"y":280,"wires":[]}]}
  }, {upsert: true}, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.remove({"path":"2c9dd332.05334c","type":"flows"}, done);
};
