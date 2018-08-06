
module.exports.id = '4ea9c35.157583c';

const _ = require('lodash'),
  config = require('../config');

/**
 * @description flow 4ea9c35.157583c update
 * @param done
 */
   

module.exports.up = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.update({"path":"4ea9c35.157583c","type":"flows"}, {
    $set: {"path":"4ea9c35.157583c","body":[{"id":"596ca35a.c156cc","type":"http in","z":"4ea9c35.157583c","name":"height","url":"/blocks/height","method":"get","upload":false,"swaggerDoc":"","x":110,"y":80,"wires":[["f89f3989.dd26e8"]]},{"id":"dee303ce.dea29","type":"mongo","z":"4ea9c35.157583c","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":470,"y":80,"wires":[["5b51682c.88a4a8"]]},{"id":"f89f3989.dd26e8","type":"function","z":"4ea9c35.157583c","name":"prepare block request","func":"const prefix = global.get('settings.mongo.collectionPrefix');\n\n\nmsg.payload = { \n    model: `${prefix}Block`, \n    request: {},\n    options: {\n      sort: {number: -1},\n      limit: 1\n  }\n};\n\n\n\nreturn msg;","outputs":1,"noerr":0,"x":280,"y":80,"wires":[["dee303ce.dea29"]]},{"id":"5b51682c.88a4a8","type":"function","z":"4ea9c35.157583c","name":"prepare response","func":"const prefix = global.get('settings.mongo.collectionPrefix');\nconst _ = global.get('_');\n\nconst blockNumber = _.get(msg.payload, '0.number', -1);\n\nmsg.payload = {currentBlock: blockNumber};\n\nreturn msg;","outputs":1,"noerr":0,"x":650,"y":80,"wires":[["64fb2da7.9f7744"]]},{"id":"64fb2da7.9f7744","type":"http response","z":"4ea9c35.157583c","name":"","statusCode":"","headers":{},"x":850,"y":80,"wires":[]},{"id":"df7255df.121dd8","type":"catch","z":"4ea9c35.157583c","name":"","scope":null,"x":140,"y":240,"wires":[["9270930f.3bafd","acc44e74.2a206"]]},{"id":"fdb45efa.4f158","type":"http response","z":"4ea9c35.157583c","name":"","statusCode":"","x":597,"y":241,"wires":[]},{"id":"9270930f.3bafd","type":"function","z":"4ea9c35.157583c","name":"transform","func":"let factories = global.get(\"factories\"); \n\nmsg.payload = factories.messages.generic.fail;\n   \nreturn msg;","outputs":1,"noerr":0,"x":381,"y":240,"wires":[["fdb45efa.4f158"]]},{"id":"acc44e74.2a206","type":"debug","z":"4ea9c35.157583c","name":"","active":true,"console":"false","complete":"error","x":446,"y":352,"wires":[]}]}
  }, {upsert: true}, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.remove({"path":"4ea9c35.157583c","type":"flows"}, done);
};
