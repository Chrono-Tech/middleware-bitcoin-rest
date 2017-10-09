const accountModel = require('../../models/accountModel'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  messages = require('../../factories/messages/genericMessageFactory'),
  decodeTxService = require('../../utils/decodeTxService'),
  calcBalanceService = require('../../utils/calcBalanceService'),
  pushTxService = require('../../utils/pushTxService'),
  fetchUTXOService = require('../../utils/fetchUTXOService');

module.exports = async (req, res) => {

  if (!req.body.tx) {
    return res.send(messages.fail);
  }

  let tx = decodeTxService(req.body.tx);

  let addresses = _.chain([])
    .union(tx.outputs, tx.inputs)
    .map(item => item.address)
    .uniq()
    .value();

  let utxos = await Promise.mapSeries(addresses, address => fetchUTXOService(address));
  utxos = _.flattenDeep(utxos);

  for (let i = 0; i < tx.inputs.length; i++) {
    let input = _.find(utxos, {txid: tx.inputs[i].prevout.hash});
    tx.inputs[i] = {
      address: _.get(input, 'address'),
      txid: _.get(input, 'txid'),
      script: _.get(input, 'scriptPubKey'),
      value: _.get(input, 'satoshis')
    };
  }

  tx.valueIn = _.chain(tx.inputs)
    .map(i => i.value)
    .sum()
    .value();

  tx.valueOut = _.chain(tx.outputs)
    .map(i => i.value)
    .sum()
    .value();

  tx.fee = tx.valueIn - tx.valueOut;

  for (let address of addresses) {
    let utxos = await fetchUTXOService(address);
    let balance = calcBalanceService(utxos);

    let delta = _.chain(tx.outputs).filter({address: address}).map(i => i.value).sum().defaultTo(0).value() -
      _.chain(tx.inputs).filter({address: address}).map(i => i.value).sum().defaultTo(0).value();

    balance.balance += delta;

    await accountModel.update({address: address}, {
      $set: {
        'balances.confirmations0': balance.balance,
        lastBlockCheck: balance.lastBlockCheck
      }
    });

  }

  await pushTxService(req.body.tx);

  res.send(tx);
};
