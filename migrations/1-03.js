'use strict';

const config = require('../config');

module.exports.id = '1.03';

/**
 * @description tabs flow settings
 * @param done
 */

module.exports.up = function (done) {
  let coll = this.db.collection(`${config.nodered.functionGlobalContext.settings.mongo.collectionPrefix}noderedstorages`);
  coll.insert({
    'meta' : {},
    'type' : 'flows',
    'path' : 'tabs',
    'body' : [
      {
        'id' : 'e415e43d.f10178',
        'type' : 'tab',
        'label' : 'tx',
        'disabled' : false,
        'info' : ''
      },
      {
        'id' : '2c9dd332.05334c',
        'type' : 'tab',
        'label' : 'address',
        'disabled' : false,
        'info' : ''
      }
    ]
  }, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection(`${config.nodered.functionGlobalContext.settings.mongo.collectionPrefix}noderedstorages`);
  coll.remove({
    'type': 'flows',
    'path': 'tabs'
  }, done);
  done();
};
