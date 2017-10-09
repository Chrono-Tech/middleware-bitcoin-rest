const _ = require('lodash');

/**
 * @service
 * @description calculate balances by specified utxos
 * @param utxos - utxo transactions
 * @returns {Promise.<[{balances, lastBlockCheck}]>}
 */

module.exports = utxos => {

  let highestCoin = _.chain(utxos)
    .sortBy('height')
    .last()
    .defaults({
      confirmations: 0,
      height: 0
    })
    .value();

  let balance = _.chain(utxos)
    .map(coin => coin.satoshis)
    .sum()
    .defaultTo(0)
    .value();

  return {
    balance: balance,
    lastBlockCheck: highestCoin.confirmations + highestCoin.height
  };
};
