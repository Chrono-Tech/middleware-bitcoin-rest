const mongoose = require('mongoose'),
  mongooseUtils = require('mongoose/lib/utils'),
  _ = require('lodash'),
  vm = require('vm');

module.exports = function (RED) {

  async function query (type, modelName, query, requestDb) {

    let connection = !requestDb || requestDb === '0' ? mongoose : (requestDb === '1' ? mongoose.accounts.test : mongoose.accounts.main);

    if (type === '0')
      return await connection.models[modelName].find(query);
    if (type === '1')
      return (await new connection.models[modelName](query).save()).toObject();
    if (type === '2')
      return await connection.models[modelName].update(...query);
    if (type === '3')
      return await connection.models[modelName].remove(query);
    if (type === '4')
      return await connection.models[modelName].aggregate(query);

    return [];
  }

  function MongoCall (redConfig) {
    RED.nodes.createNode(this, redConfig);
    let node = this;
    this.on('input', async function (msg) {

      let modelName = redConfig.mode === '1' ? msg.payload.model : redConfig.model;
      let requestDb = redConfig.mode === '1' ? msg.payload.requestDb : redConfig.requestDb;

      let models = (!requestDb || requestDb === '0' ? mongoose : (requestDb === '1' ? mongoose.accounts.test : mongoose.accounts.main)).modelNames();
      let origName = _.find(models, m => m.toLowerCase() === mongooseUtils.toCollectionName(modelName));

      if (!origName) {
        msg.payload = [];
        return node.send(msg);
      }

      try {
        if (redConfig.mode === '0') {
          const script = new vm.Script(`(()=>(${redConfig.request}))()`);
          const context = vm.createContext({});
          msg.payload = script.runInContext(context);
        }

        msg.payload = await query(redConfig.requestType, origName, msg.payload.request, requestDb);
        node.send(msg);
      } catch (err) {
        console.log(err);
        this.error(JSON.stringify(err), msg);
      }

    });
  }

  RED.nodes.registerType('mongo', MongoCall);
};
