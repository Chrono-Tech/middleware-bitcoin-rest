
module.exports.id = '16.a93f8a7a.554448';

const _ = require('lodash'),
  config = require('../config');

/**
 * @description flow a93f8a7a.554448 update
 * @param done
 */
   

module.exports.up = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.update({"path":"a93f8a7a.554448","type":"flows"}, {
    $set: {"path":"a93f8a7a.554448","body":[{"id":"b8040c57.02071","type":"http in","z":"a93f8a7a.554448","name":"height","url":"/blocks/height","method":"get","upload":false,"swaggerDoc":"","x":110,"y":100,"wires":[["b749f3d4.f3e7e"]]},{"id":"b749f3d4.f3e7e","type":"function","z":"a93f8a7a.554448","name":"","func":"const prefix = global.get('settings.mongo.collectionPrefix');\nconst _ = global.get('_');\n\nmsg.address = msg.req.params.addr;\n\n\nmsg.payload ={ \n    model: `${prefix}Block`, \n    request: {number: {$ne: -1}},\n  options: {\n      sort: {timestamp: -1},\n      limit: parseInt(msg.req.query.limit) || 1,\n      skip:  0\n  }\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":250,"y":100,"wires":[["9edd83cf.916e8"]]},{"id":"9edd83cf.916e8","type":"mongo","z":"a93f8a7a.554448","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":410,"y":100,"wires":[["a31c21e0.6fed3"]]},{"id":"b2d7a7ef.ce4378","type":"http response","z":"a93f8a7a.554448","name":"","statusCode":"","x":710,"y":100,"wires":[]},{"id":"a31c21e0.6fed3","type":"function","z":"a93f8a7a.554448","name":"","func":"const _ = global.get('_');\n\n\n\nmsg.payload = {height: _.get(msg.payload, '0.number', 0)};\n\nreturn msg;","outputs":1,"noerr":0,"x":550,"y":100,"wires":[["b2d7a7ef.ce4378"]]}]}
  }, {upsert: true}, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.remove({"path":"a93f8a7a.554448","type":"flows"}, done);
};
