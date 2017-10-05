const Network = require('bcoin/lib/protocol/network'),
  TX = require('bcoin/lib/primitives/tx'),
  config = require('../config');

/**
 * @service
 * @description get balances for each account
 * @param txHex - raw transaction
 * @returns {Promise.<[{balance, account}]>}
 */

module.exports = txHex => {

  let decodedTx = TX.fromRaw(txHex, 'hex');
  let network = Network.get(config.bitcoin.network);
  return decodedTx.getJSON(network);

};
