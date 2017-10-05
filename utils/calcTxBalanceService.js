const _ = require('lodash'),
  Promise = require('bluebird'),
  fetchUTXOService = require('./fetchUTXOService');

/**
 * @service
 * @description get balances for each account
 * @param tx - decoded transaction
 * @returns {Promise.<[{balance, account}]>}
 */

module.exports = async tx => {

  let addresses = _.chain(tx.inputs)
    .map(input => input.address)
    .uniq()
    .value();

  let coinInput = await Promise.mapSeries(addresses, address => fetchUTXOService(address));
  coinInput = _.flattenDeep(coinInput);

  let inAddresses = _.chain(tx.inputs)
    .map(input => input.address)
    .uniq()
    .map(address => {
      let inValue = _.chain(coinInput)
        .filter(input =>
          input.address === address &&
          _.find(tx.inputs, inputTx => inputTx.prevout.hash === input.txid)
        )
        .map(i => _.get(i, 'satoshis', 0))
        .sum()
        .value();

      let outValue = _.chain(tx.outputs)
        .filter({address: address})
        .map(out => _.get(out, 'value', 0))
        .sum()
        .value();

      return {
        address: address,
        amount: outValue - inValue
      };
    })
    .value();

  let outAddresses = _.chain(tx.outputs)
    .reject(output => _.find(inAddresses, {address: output.address}))
    .map(output => ({address: output.address, amount: output.value}))
    .groupBy('address')
    .map((value, key) => ({
      address: key,
      amount: _.chain(value)
        .map(i => i.amount)
        .sum()
        .value()
    })
    )
    .value();

  return _.union(inAddresses, outAddresses);

};
